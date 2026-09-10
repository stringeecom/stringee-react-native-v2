const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const nativeCalls = [];
const nativeModule = new Proxy(
  {},
  {
    get(_target, property) {
      if (property === 'createClientWrapper') {
        return (...args) => nativeCalls.push(args);
      }
      return () => undefined;
    },
  },
);

class Component {
  constructor(props) {
    this.props = props;
  }
}

const reactMock = {
  Component,
  createElement: () => null,
};

const reactNativeMock = {
  EmitterSubscription: class {},
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
  Platform: {OS: 'ios'},
  StyleSheet: {flatten: style => style ?? {}},
  UIManager: {
    getViewManagerConfig: () => ({Commands: {create: 1, reload: 2}}),
    dispatchViewManagerCommand: () => undefined,
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

const sdk = require('../../lib/commonjs');
Module._load = originalLoad;

const expectedRuntimeExports = [
  'AudioDevice',
  'CallType',
  'ChangeType',
  'ChatRequest',
  'Conversation',
  'ConversationInfo',
  'ConversationOption',
  'LiveChatTicketParam',
  'MediaState',
  'MediaType',
  'Message',
  'NewMessageInfo',
  'ObjectType',
  'SignalingState',
  'StringeeCall',
  'StringeeCall2',
  'StringeeCall2Listener',
  'StringeeCallListener',
  'StringeeClient',
  'StringeeClientListener',
  'StringeeError',
  'StringeeRoomUser',
  'StringeeServerAddress',
  'StringeeVideoScalingType',
  'StringeeVideoTrack',
  'StringeeVideoView',
  'TrackType',
  'User',
  'UserInfo',
  'VideoResolution',
];

test('preserves the complete runtime export surface', () => {
  assert.deepEqual(Object.keys(sdk).sort(), expectedRuntimeExports.sort());
});

test('constructs StringeeClient without options as before', () => {
  const client = new sdk.StringeeClient();

  assert.equal(typeof client.uuid, 'string');
  assert.equal(nativeCalls.length, 1);
  assert.equal(nativeCalls[0][0], client.uuid);
  assert.deepEqual(nativeCalls[0].slice(1), [undefined, undefined, undefined]);
});

test('keeps listener classes assignable one callback at a time', () => {
  const listener = new sdk.StringeeClientListener();
  listener.onConnect = () => undefined;

  assert.equal(typeof listener.onConnect, 'function');
});

test('preserves enum runtime values', () => {
  assert.equal(sdk.SignalingState.answered, 'answered');
  assert.equal(sdk.StringeeVideoScalingType.fill, 'fill');
  assert.equal(sdk.VideoResolution.hd, 'HD');
});
