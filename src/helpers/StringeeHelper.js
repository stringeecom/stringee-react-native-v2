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
    onReceiveRemoteTrack: 'didAddRemoteTrack'
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
    onAudioDeviceChange: 'onAudioDeviceChange', ///only for android
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
  'onAudioDeviceChange',
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
  'onAudioDeviceChange',
];

const StringeeVideoScalingType = {
  fit: 'fit',
  fill: 'fill',
};

const MediaType = {
  audio: 'audio',
  video: 'video',
};

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

const MediaState = {
  connected: 'connected',
  disconnected: 'disconnected',
};

const AudioDevice = {
  speakerPhone: 'speakerPhone',
  wiredHeadset: 'wiredHeadset',
  earpiece: 'earpiece',
  bluetooth: 'bluetooth',
  none: 'none',
};

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

function getMediaState(code: number): MediaState {
  switch (code) {
    case 0:
      return MediaState.connected;
    case 1:
    default:
      return MediaState.disconnected;
  }
}

function getAudioDevice(audioDevice: string): AudioDevice {
  switch (audioDevice) {
    case 'SPEAKER_PHONE':
      return AudioDevice.speakerPhone;
    case 'WIRED_HEADSET':
      return AudioDevice.wiredHeadset;
    case 'EARPIECE':
      return AudioDevice.earpiece;
    case 'BLUETOOTH':
      return AudioDevice.bluetooth;
    case 'NONE':
    default:
      return AudioDevice.none;
  }
}

function getListAudioDevice(audioDevices: Array): Array<AudioDevice> {
  let availableAudioDevices = [];
  audioDevices.forEach(audioDevice => {
    availableAudioDevices.push(getAudioDevice(audioDevice));
  });
  return availableAudioDevices;
}

function getMediaType(code: number): MediaType {
  switch (code) {
    case 2:
      return MediaType.video;
    case 1:
    default:
      return MediaType.audio;
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
  SignalingState,
  MediaState,
  AudioDevice,
  VideoResolution,
  CallType,
  RNStringeeClient,
  isIOS,
  isAndroid,
  TrackType,
  normalCallbackHandle,
  getSignalingState,
  getMediaState,
  getMediaType,
  getListAudioDevice,
  getAudioDevice,
  getTrackType,
};
