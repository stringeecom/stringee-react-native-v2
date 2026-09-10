const Module = require('node:module');
const assert = require('node:assert/strict');

const dispatchedCommands = [];

class Component {
  constructor(props) {
    this.props = props;
  }
}

const nativeModule = new Proxy(
  {},
  {
    get() {
      return () => undefined;
    },
  },
);

const reactMock = {
  Component,
  createElement: () => null,
};

const reactNativeMock = {
  NativeEventEmitter: class {
    addListener() {
      return {remove() {}};
    }
  },
  NativeModules: {
    RNStringeeCall: nativeModule,
    RNStringeeCall2: nativeModule,
    RNStringeeClient: nativeModule,
  },
  Platform: {OS: 'android'},
  StyleSheet: {flatten: style => style ?? {}},
  UIManager: {
    RNStringeeVideoView: {Commands: {create: 1, reload: 2}},
    dispatchViewManagerCommand: (...args) => dispatchedCommands.push(args),
  },
  View: 'View',
  findNodeHandle: () => 1,
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

const sdk = require(process.argv[2]);
Module._load = originalLoad;

if (typeof sdk.StringeeClient !== 'function') {
  throw new Error('StringeeClient is not available from the installed package.');
}

new sdk.StringeeClient();
const videoView = new sdk.StringeeVideoView({
  local: true,
  style: {height: 120, width: 160},
  uuid: 'legacy-view',
});
videoView.componentDidMount();
videoView.reload();

assert.equal(dispatchedCommands.length, 2);
