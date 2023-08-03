import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import type {RNStringeeEventCallback} from './helpers/StringeeHelper';
import {
  callEvents,
  getAudioDevice,
  getListAudioDevice,
  getMediaState,
  getMediaType,
  getSignalingState,
  stringeeCall2Events,
} from './helpers/StringeeHelper';
import {
  CallType,
  StringeeCall2Listener,
  StringeeClient,
  VideoResolution,
} from '../index';

const RNStringeeCall2 = NativeModules.RNStringeeCall2;

class StringeeCall2Props {
  stringeeClient: StringeeClient;
  from: string;
  to: string;
}

class StringeeCall2 {
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

  constructor(props: StringeeCall2Props) {
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
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall2);
  }

  registerEvents(stringeeCall2Listener: StringeeCall2Listener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (stringeeCall2Listener) {
      stringeeCall2Events.forEach(event => {
        if (stringeeCall2Listener[event]) {
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
                    stringeeCall2Listener.onChangeSignalingState(
                      this,
                      getSignalingState(data.code),
                      data.reason,
                      data.sipCode,
                      data.sipReason,
                    );
                    break;
                  case 'onChangeMediaState':
                    stringeeCall2Listener.onChangeMediaState(
                      this,
                      getMediaState(data.code),
                      data.description,
                    );
                    break;
                  case 'onReceiveLocalStream':
                    stringeeCall2Listener.onReceiveLocalStream(this);
                    break;
                  case 'onReceiveRemoteStream':
                    stringeeCall2Listener.onReceiveRemoteStream(this);
                    break;
                  case 'onReceiveDtmfDigit':
                    stringeeCall2Listener.onReceiveDtmfDigit(this, data.dtmf);
                    break;
                  case 'onReceiveCallInfo':
                    stringeeCall2Listener.onReceiveCallInfo(this, data.data);
                    break;
                  case 'onHandleOnAnotherDevice':
                    stringeeCall2Listener.onHandleOnAnotherDevice(
                      this,
                      getSignalingState(data.code),
                      data.description,
                    );
                    break;
                  case 'onAudioDeviceChange':
                    stringeeCall2Listener.onAudioDeviceChange(
                      getAudioDevice(data.selectedAudioDevice),
                      getListAudioDevice(data.availableAudioDevices),
                    );
                    break;
                  case 'onTrackMediaStateChange':
                    stringeeCall2Listener.onTrackMediaStateChange(
                      data.from,
                      getMediaType(data.mediaType),
                      data.enable,
                    );
                    break;
                }
              },
            ),
          );
          this.events.push(callEvents[Platform.OS][event]);
          RNStringeeCall2.setNativeEvent(callEvents[Platform.OS][event]);
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

    this.events.forEach(e => RNStringeeCall2.removeNativeEvent(e));
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
    RNStringeeCall2.makeCall(
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
    RNStringeeCall2.initAnswer(this.clientId, this.callId, callback);
  }

  answer(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.answer(this.callId, callback);
  }

  hangup(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.hangup(this.callId, callback);
  }

  reject(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.reject(this.callId, callback);
  }

  sendDTMF(dtmf: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.sendDTMF(this.callId, dtmf, callback);
  }

  getCallStats(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.getCallStats(this.clientId, this.callId, callback);
  }

  switchCamera(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.switchCamera(this.callId, callback);
  }

  enableVideo(enabled: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.enableVideo(this.callId, enabled, callback);
  }

  mute(mute: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.mute(this.callId, mute, callback);
  }

  setSpeakerphoneOn(on: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.setSpeakerphoneOn(this.callId, on, callback);
  }

  resumeVideo(callback: RNStringeeEventCallback) {
    const platform = Platform.OS;
    if (platform === 'ios') {
      console.warn('this function only for android');
    } else {
      if (!callback) {
        callback = () => {};
      }
      RNStringeeCall2.resumeVideo(this.callId, callback);
    }
  }

  sendCallInfo(callInfo: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.sendCallInfo(this.callId, callInfo, callback);
  }

  setAutoSendTrackMediaStateChangeEvent(
    autoSendTrackMediaStateChangeEvent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall2.setAutoSendTrackMediaStateChangeEvent(
      this.callId,
      autoSendTrackMediaStateChangeEvent,
      callback,
    );
  }
}
export {StringeeCall2};
