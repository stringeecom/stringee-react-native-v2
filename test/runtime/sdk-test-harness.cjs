const Module = require('node:module');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '../..');
const compiledRoot = path.join(packageRoot, 'lib/commonjs');

function loadSdk({
  findNodeHandleValue = 101,
  legacyViewManager = false,
  platform = 'ios',
} = {}) {
  for (const cachedPath of Object.keys(require.cache)) {
    if (cachedPath.startsWith(compiledRoot)) {
      delete require.cache[cachedPath];
    }
  }

  const calls = new Map();
  const handlers = new Map();
  const eventSubscriptions = [];
  const dispatchedCommands = [];

  const keyFor = (moduleName, method) => `${moduleName}.${String(method)}`;

  function recordCall(moduleName, method, args) {
    const key = keyFor(moduleName, method);
    const methodCalls = calls.get(key) ?? [];
    methodCalls.push(args);
    calls.set(key, methodCalls);
  }

  function createNativeModule(moduleName) {
    return new Proxy(
      {},
      {
        get(_target, method) {
          if (method === 'addListener' || method === 'removeListeners') {
            return () => undefined;
          }
          return (...args) => {
            recordCall(moduleName, method, args);
            const handler = handlers.get(keyFor(moduleName, method));
            if (handler) {
              return handler(...args);
            }

            const callback = [...args].reverse().find(arg => typeof arg === 'function');
            if (callback) {
              callback(true, 0, 'Success');
            }
            return undefined;
          };
        },
      },
    );
  }

  class Component {
    constructor(props) {
      this.props = props;
    }
  }

  class NativeEventEmitter {
    addListener(eventName, listener) {
      const subscription = {eventName, listener, removed: false};
      eventSubscriptions.push(subscription);
      return {
        remove() {
          subscription.removed = true;
        },
      };
    }
  }

  const viewManagerConfig = {Commands: {create: 1, reload: 2}};
  const uiManager = {
    dispatchViewManagerCommand: (...args) => dispatchedCommands.push(args),
    getViewManagerConfig: legacyViewManager ? undefined : () => viewManagerConfig,
  };
  if (legacyViewManager) {
    uiManager.RNStringeeVideoView = viewManagerConfig;
  }

  const nativeModules = {
    RNStringeeCall: createNativeModule('RNStringeeCall'),
    RNStringeeCall2: createNativeModule('RNStringeeCall2'),
    RNStringeeClient: createNativeModule('RNStringeeClient'),
  };
  const reactMock = {
    Component,
    createElement: (type, props, ...children) => ({type, props, children}),
  };
  const reactNativeMock = {
    NativeEventEmitter,
    NativeModules: nativeModules,
    Platform: {OS: platform},
    StyleSheet: {
      flatten: style =>
        Array.isArray(style)
          ? Object.assign({}, ...style.filter(Boolean))
          : style ?? {},
    },
    UIManager: uiManager,
    View: 'View',
    findNodeHandle: () => findNodeHandleValue,
    requireNativeComponent: () => 'RNStringeeVideoView',
  };

  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === 'react') {
      return reactMock;
    }
    if (request === 'react-native') {
      return reactNativeMock;
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  let sdk;
  try {
    sdk = require(compiledRoot);
  } finally {
    Module._load = originalLoad;
  }

  return {
    callsFor(moduleName, method) {
      return calls.get(keyFor(moduleName, method)) ?? [];
    },
    dispatchedCommands,
    emit(eventName, payload) {
      for (const subscription of eventSubscriptions) {
        if (!subscription.removed && subscription.eventName === eventName) {
          subscription.listener(payload);
        }
      }
    },
    fail(moduleName, method, code = 500, message = 'Native failure') {
      handlers.set(keyFor(moduleName, method), (...args) => {
        const callback = [...args].reverse().find(arg => typeof arg === 'function');
        callback(false, code, message);
      });
    },
    handle(moduleName, method, handler) {
      handlers.set(keyFor(moduleName, method), handler);
    },
    sdk,
    succeed(moduleName, method, ...values) {
      handlers.set(keyFor(moduleName, method), (...args) => {
        const callback = [...args].reverse().find(arg => typeof arg === 'function');
        callback(true, 0, 'Success', ...values);
      });
    },
  };
}

module.exports = {loadSdk};
