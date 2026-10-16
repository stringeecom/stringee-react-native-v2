import {NativeModules, Platform} from 'react-native';
import {StringeeError} from './StringeeError';

type NativeMethod = (...args: any[]) => any;
type StringeeNativeModule = Record<string, NativeMethod>;

const RNStringeeClient =
  NativeModules.RNStringeeClient as StringeeNativeModule;
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

type StringeeClientEvent =
  | 'onConnect'
  | 'onDisConnect'
  | 'onFailWithError'
  | 'onRequestAccessToken'
  | 'onIncomingCall'
  | 'onIncomingCallObject'
  | 'onIncomingCall2'
  | 'onIncomingCall2Object'
  | 'onCustomMessage'
  | 'onObjectChange'
  | 'onReceiveChatRequest'
  | 'onReceiveTransferChatRequest'
  | 'onTimeoutAnswerChat'
  | 'onTimeoutInQueue'
  | 'onConversationEnded'
  | 'onUserBeginTyping'
  | 'onUserEndTyping';

type StringeeCallEvent =
  | 'onChangeSignalingState'
  | 'onChangeMediaState'
  | 'onReceiveLocalStream'
  | 'onReceiveRemoteStream'
  | 'onReceiveLocalTrack'
  | 'onReceiveRemoteTrack'
  | 'onReceiveDtmfDigit'
  | 'onReceiveCallInfo'
  | 'onHandleOnAnotherDevice'
  | 'onAudioDeviceChange'
  | 'onTrackMediaStateChange';

type PlatformEventMap<TEvent extends string> = Record<
  'android' | 'ios',
  Partial<Record<TEvent, string>>
>;

const clientEvents: PlatformEventMap<StringeeClientEvent> = {
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

const stringeeClientEvents: StringeeClientEvent[] = [
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

const callEvents: PlatformEventMap<StringeeCallEvent> = {
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

const stringeeCallEvents: StringeeCallEvent[] = [
  'onChangeSignalingState',
  'onChangeMediaState',
  'onReceiveLocalStream',
  'onReceiveRemoteStream',
  'onReceiveDtmfDigit',
  'onReceiveCallInfo',
  'onHandleOnAnotherDevice',
  'onAudioDeviceChange',
];

const stringeeCall2Events: StringeeCallEvent[] = [
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

/** Video resize behavior used by `StringeeVideoView`. */
const StringeeVideoScalingType = {
  fit: 'fit',
  fill: 'fill',
} as const;
type StringeeVideoScalingType =
  (typeof StringeeVideoScalingType)[keyof typeof StringeeVideoScalingType];

/** Media kind reported by track media-state changes. */
const MediaType = {
  audio: 'audio',
  video: 'video',
} as const;
type MediaType = (typeof MediaType)[keyof typeof MediaType];

/** Chat object kind reported by `StringeeClientListener.onObjectChange`. */
const ObjectType = {
  conversation: 'conversation',
  message: 'message',
} as const;
type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];

/** Mutation kind reported by `StringeeClientListener.onObjectChange`. */
const ChangeType = {
  insert: 'insert',
  update: 'update',
  delete: 'delete',
} as const;
type ChangeType = (typeof ChangeType)[keyof typeof ChangeType];

/** High-level call signaling lifecycle. */
const SignalingState = {
  calling: 'calling',
  ringing: 'ringing',
  answered: 'answered',
  busy: 'busy',
  ended: 'ended',
} as const;
type SignalingState = (typeof SignalingState)[keyof typeof SignalingState];

/** Connection state of a call's media path. */
const MediaState = {
  connected: 'connected',
  disconnected: 'disconnected',
} as const;
type MediaState = (typeof MediaState)[keyof typeof MediaState];

/** Audio routes reported by Android call listeners. */
const AudioDevice = {
  speakerPhone: 'speakerPhone',
  wiredHeadset: 'wiredHeadset',
  earpiece: 'earpiece',
  bluetooth: 'bluetooth',
  none: 'none',
} as const;
type AudioDevice = (typeof AudioDevice)[keyof typeof AudioDevice];

/** Capture resolution requested for outgoing and answered video calls. */
const VideoResolution = {
  normal: 'NORMAL',
  hd: 'HD',
} as const;
type VideoResolution = (typeof VideoResolution)[keyof typeof VideoResolution];

/** Direction and endpoint category of a call. */
const CallType = {
  appToAppOutgoing: 'appToAppOutgoing',
  appToAppIncoming: 'appToAppIncoming',
  appToPhone: 'appToPhone',
  phoneToApp: 'phoneToApp',
} as const;
type CallType = (typeof CallType)[keyof typeof CallType];

/** Source category of a `StringeeVideoTrack`. */
const TrackType = {
  camera: 'camera',
  screen: 'screen',
  player: 'player',
} as const;
type TrackType = (typeof TrackType)[keyof typeof TrackType];

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

function getListAudioDevice(audioDevices: string[]): AudioDevice[] {
  const availableAudioDevices: AudioDevice[] = [];
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

const normalCallbackHandle = (
  resolve: (value?: any) => void,
  reject: (reason?: unknown) => void,
  name = '',
) => {
  return (status: boolean, code: number, message: string) => {
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

export type {StringeeCallEvent, StringeeClientEvent, StringeeNativeModule};
