import {NativeModules, Platform} from 'react-native';
import {StringeeError} from '../../index';

const RNStringeeClient = NativeModules.RNStringeeClient;
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

const clientEvents = {
  ios: {
    onConnect: 'didConnect',
    onDisConnect: 'didDisConnect',
    onFailWithError: 'didFailWithError',
    onRequestAccessToken: 'requestAccessToken',
    onIncomingCall: 'incomingCall',
    onIncomingCallObject: 'incomingCall',
    onIncomingCall2: 'incomingCall2',
    onIncomingCall2Object: 'incomingCall2',
    onCustomMessage: 'didReceiveCustomMessage',
    onObjectChange: 'objectChangeNotification',
    onReceiveChatRequest: 'didReceiveChatRequest',
    onReceiveTransferChatRequest: 'didReceiveTransferChatRequest',
    onTimeoutAnswerChat: 'timeoutAnswerChat',
    onTimeoutInQueue: 'timeoutInQueue',
    onConversationEnded: 'conversationEnded',
    onUserBeginTyping: 'userBeginTyping',
    onUserEndTyping: 'userEndTyping',
  },
  android: {
    onConnect: 'onConnectionConnected',
    onDisConnect: 'onConnectionDisconnected',
    onFailWithError: 'onConnectionError',
    onRequestAccessToken: 'onRequestNewToken',
    onIncomingCall: 'onIncomingCall',
    onIncomingCallObject: 'onIncomingCall',
    onIncomingCall2: 'onIncomingCall2',
    onIncomingCall2Object: 'onIncomingCall2',
    onCustomMessage: 'onCustomMessage',
    onObjectChange: 'onChangeEvent',
    onReceiveChatRequest: 'onReceiveChatRequest',
    onReceiveTransferChatRequest: 'onReceiveTransferChatRequest',
    onTimeoutAnswerChat: 'onTimeoutAnswerChat',
    onTimeoutInQueue: 'onTimeoutInQueue',
    onConversationEnded: 'onConversationEnded',
    onUserBeginTyping: 'onTyping',
    onUserEndTyping: 'onEndTyping',
  },
};

const stringeeClientEvents = [
  'onConnect',
  'onDisConnect',
  'onFailWithError',
  'onRequestAccessToken',
  'onIncomingCall',
  'onIncomingCall2',
  'onCustomMessage',
  'onObjectChange',
  'onReceiveChatRequest',
  'onReceiveTransferChatRequest',
  'onTimeoutAnswerChat',
  'onTimeoutInQueue',
  'onConversationEnded',
  'onUserBeginTyping',
  'onUserEndTyping',
];

const callEvents = {
  ios: {
    onChangeSignalingState: 'didChangeSignalingState',
    onChangeMediaState: 'didChangeMediaState',
    onReceiveLocalStream: 'didReceiveLocalStream',
    onReceiveRemoteStream: 'didReceiveRemoteStream',
    onReceiveDtmfDigit: 'didReceiveDtmfDigit',
    onReceiveCallInfo: 'didReceiveCallInfo',
    onHandleOnAnotherDevice: 'didHandleOnAnotherDevice',
    onTrackMediaStateChange: 'trackMediaStateChange',
    onReceiveLocalTrack: 'didAddLocalTrack',
    onReceiveRemoteTrack: 'didAddRemoteTrack',
  },
  android: {
    onChangeSignalingState: 'onSignalingStateChange',
    onChangeMediaState: 'onMediaStateChange',
    onReceiveLocalStream: 'onLocalStream',
    onReceiveRemoteStream: 'onRemoteStream',
    onReceiveLocalTrack: 'onLocalTrackAdded',
    onReceiveRemoteTrack: 'onRemoteTrackAdded',
    onReceiveDtmfDigit: 'onDTMF',
    onReceiveCallInfo: 'onCallInfo',
    onHandleOnAnotherDevice: 'onHandledOnAnotherDevice',
    onTrackMediaStateChange: 'onTrackMediaStateChange',
  },
};

const stringeeCallEvents = [
  'onChangeSignalingState',
  'onChangeMediaState',
  'onReceiveLocalStream',
  'onReceiveRemoteStream',
  'onReceiveDtmfDigit',
  'onReceiveCallInfo',
  'onHandleOnAnotherDevice',
];

const stringeeCall2Events = [
  'onChangeSignalingState',
  'onChangeMediaState',
  'onReceiveLocalTrack',
  'onReceiveRemoteTrack',
  'onReceiveDtmfDigit',
  'onReceiveCallInfo',
  'onHandleOnAnotherDevice',
  'onTrackMediaStateChange',
];

const stringeeAudioEvents = 'onAudioDeviceChange';

const StringeeVideoScalingType = {
  fit: 'fit',
  fill: 'fill',
};

const MediaType = {
  audio: 'audio',
  video: 'video',
};

function getMediaType(code: number): MediaType {
  switch (code) {
    case 2:
      return MediaType.video;
    case 1:
    default:
      return MediaType.audio;
  }
}

const ObjectType = {
  conversation: 'conversation',
  message: 'message',
};

const ChangeType = {
  insert: 'insert',
  update: 'update',
  delete: 'delete',
};

const SignalingState = {
  calling: 'calling',
  ringing: 'ringing',
  answered: 'answered',
  busy: 'busy',
  ended: 'ended',
};

function getSignalingState(code: number): SignalingState {
  switch (code) {
    case 0:
      return SignalingState.calling;
    case 1:
      return SignalingState.ringing;
    case 2:
      return SignalingState.answered;
    case 3:
      return SignalingState.busy;
    case 4:
    default:
      return SignalingState.ended;
  }
}

const MediaState = {
  connected: 'connected',
  disconnected: 'disconnected',
};

function getMediaState(code: number): MediaState {
  switch (code) {
    case 0:
      return MediaState.connected;
    case 1:
    default:
      return MediaState.disconnected;
  }
}

const VideoResolution = {
  normal: 'NORMAL',
  hd: 'HD',
};

const CallType = {
  appToAppOutgoing: 'appToAppOutgoing',
  appToAppIncoming: 'appToAppIncoming',
  appToPhone: 'appToPhone',
  phoneToApp: 'phoneToApp',
};

const TrackType = {
  camera: 'camera',
  screen: 'screen',
  player: 'player',
};

function getTrackType(code: number): TrackType {
  switch (code) {
    case 1:
      return TrackType.screen;
    case 2:
      return TrackType.player;
    case 0:
    default:
      return TrackType.camera;
  }
}

const AudioType = {
  speakerPhone: 0,
  wiredHeadset: 1,
  earpiece: 2,
  bluetooth: 3,
  other: 4,
  none: -1,
};

function getAudioType(value: number): AudioType {
  switch (value) {
    case 0:
      return AudioType.speakerPhone;
    case 1:
      return AudioType.wiredHeadset;
    case 2:
      return AudioType.earpiece;
    case 3:
      return AudioType.bluetooth;
    case 4:
      return AudioType.other;
    default:
      return AudioType.none;
  }
}

const normalCallbackHandle = (resolve, reject, name) => {
  return (status, code, message) => {
    if (status) {
      resolve();
    } else {
      reject(new StringeeError(code, message, name));
    }
  };
};

function genUUID() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export {
  clientEvents,
  callEvents,
  MediaType,
  StringeeVideoScalingType,
  ObjectType,
  ChangeType,
  stringeeClientEvents,
  stringeeCallEvents,
  stringeeCall2Events,
  stringeeAudioEvents,
  SignalingState,
  MediaState,
  VideoResolution,
  CallType,
  RNStringeeClient,
  isIOS,
  isAndroid,
  TrackType,
  AudioType,
  normalCallbackHandle,
  getSignalingState,
  getMediaState,
  getMediaType,
  getTrackType,
  getAudioType,
  genUUID,
};
