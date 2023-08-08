import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import type {RNStringeeEventCallback} from './helpers/StringeeHelper';
import {
  callEvents,
  getAudioDevice,
  getListAudioDevice,
  getMediaState,
  getSignalingState,
  stringeeCallEvents,
} from './helpers/StringeeHelper';
import {
  CallType,
  StringeeCallListener,
  StringeeClient,
  VideoResolution,
} from '../index';

const RNStringeeCall = NativeModules.RNStringeeCall;

class StringeeCallProps {
  stringeeClient: StringeeClient;
  from: string;
  to: string;
}

class StringeeCall {
  clientId: string;
  callId: string;
  customData: string;
  from: string;
  fromAlias: string;
  to: string;
  toAlias: string;
  callType: CallType;
  isVideoCall: boolean;
  videoResolution: VideoResolution = VideoResolution.normal;

  constructor(props: StringeeCallProps) {
    if (props === undefined) {
      props = {};
    }
    if (props.stringeeClient) {
      this.clientId = props.stringeeClient.uuid;
    }
    if (props.clientId) {
      this.clientId = props.clientId;
    }
    this.from = props.from;
    this.to = props.to;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall);
  }

  registerEvents(stringeeCallListener: StringeeCallListener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (stringeeCallListener) {
      stringeeCallEvents.forEach(event => {
        if (stringeeCallListener[event]) {
          this.subscriptions.push(
            this.eventEmitter.addListener(
              callEvents[Platform.OS][event],
              data => {
                if (data !== undefined) {
                  if (data.callId !== undefined) {
                    this.callId = data.callId;
                  }
                }
                switch (event) {
                  case 'onChangeSignalingState':
                    stringeeCallListener.onChangeSignalingState(
                      this,
                      getSignalingState(data.code),
                      data.reason,
                      data.sipCode,
                      data.sipReason,
                    );
                    break;
                  case 'onChangeMediaState':
                    stringeeCallListener.onChangeMediaState(
                      this,
                      getMediaState(data.code),
                      data.description,
                    );
                    break;
                  case 'onReceiveLocalStream':
                    stringeeCallListener.onReceiveLocalStream(this);
                    break;
                  case 'onReceiveRemoteStream':
                    stringeeCallListener.onReceiveRemoteStream(this);
                    break;
                  case 'onReceiveDtmfDigit':
                    stringeeCallListener.onReceiveDtmfDigit(this, data.dtmf);
                    break;
                  case 'onReceiveCallInfo':
                    stringeeCallListener.onReceiveCallInfo(this, data.data);
                    break;
                  case 'onHandleOnAnotherDevice':
                    stringeeCallListener.onHandleOnAnotherDevice(
                      this,
                      getSignalingState(data.code),
                      data.description,
                    );
                    break;
                  case 'onAudioDeviceChange':
                    stringeeCallListener.onAudioDeviceChange(
                      getAudioDevice(data.selectedAudioDevice),
                      getListAudioDevice(data.availableAudioDevices),
                    );
                    break;
                }
              },
            ),
          );
          this.events.push(callEvents[Platform.OS][event]);
          RNStringeeCall.setNativeEvent(callEvents[Platform.OS][event]);
        }
      });
    }
  }

  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }

    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeCall.removeNativeEvent(e));
    this.events = [];
  }

  makeCall(callback: RNStringeeEventCallback) {
    const makeCallParam = {
      from: this.from,
      to: this.to,
      isVideoCall: this.isVideoCall,
      customData: this.customData,
      videoResolution: this.videoResolution,
    };
    RNStringeeCall.makeCall(
      this.clientId,
      JSON.stringify(makeCallParam),
      (status, code, message, callId, customData) => {
        this.callId = callId;
        if (!callback) {
          callback = () => {};
        }
        return callback(status, code, message, callId, customData);
      },
    );
  }

  initAnswer(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.initAnswer(this.clientId, this.callId, callback);
  }

  answer(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.answer(this.callId, callback);
  }

  hangup(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.hangup(this.callId, callback);
  }

  reject(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.reject(this.callId, callback);
  }

  sendDTMF(dtmf: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.sendDTMF(this.callId, dtmf, callback);
  }

  sendCallInfo(callInfo: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.sendCallInfo(this.callId, callInfo, callback);
  }

  getCallStats(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.getCallStats(this.clientId, this.callId, callback);
  }

  switchCamera(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.switchCamera(this.callId, callback);
  }

  enableVideo(enabled: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.enableVideo(this.callId, enabled, callback);
  }

  mute(mute: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.mute(this.callId, mute, callback);
  }

  setSpeakerphoneOn(on: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.setSpeakerphoneOn(this.callId, on, callback);
  }

  resumeVideo(callback: RNStringeeEventCallback) {
    const platform = Platform.OS;
    if (platform === 'ios') {
      console.warn('this function only for android');
    } else {
      if (!callback) {
        callback = () => {};
      }
      RNStringeeCall.resumeVideo(this.callId, callback);
    }
  }
}
export {StringeeCall};
