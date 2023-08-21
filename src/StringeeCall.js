import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
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

class StringeeCall {
  stringeeClient: StringeeClient;
  callId: string;
  customData: string;
  from: string;
  fromAlias: string;
  to: string;
  toAlias: string;
  callType: CallType;
  isVideoCall: boolean;
  videoResolution: VideoResolution = VideoResolution.normal;

  /**
   * Create the StringeeCall.
   * @param {StringeeClient} props.stringeeClient StringeeClient used to connect to the Stringee server
   * @param {string} props.from From number
   * @param {string} props.to To number
   */
  constructor(props: {
    stringeeClient: StringeeClient,
    from: string,
    to: string,
  }) {
    if (props === undefined) {
      props = {};
    }
    if (props.stringeeClient) {
      this.stringeeClient = props.stringeeClient;
    }
    this.from = props.from;
    this.to = props.to;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall);
  }

  /**
   * Register to listen to events from StringeeCall.
   * @function registerEvents
   * @param {StringeeCallListener} listener
   */
  registerEvents(listener: StringeeCallListener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (listener) {
      stringeeCallEvents.forEach(event => {
        if (listener[event]) {
          let emitterSubscription: EmitterSubscription =
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
                    listener.onChangeSignalingState(
                      this,
                      getSignalingState(data.code),
                      data.reason,
                      data.sipCode,
                      data.sipReason,
                    );
                    break;
                  case 'onChangeMediaState':
                    listener.onChangeMediaState(
                      this,
                      getMediaState(data.code),
                      data.description,
                    );
                    break;
                  case 'onReceiveLocalStream':
                    listener.onReceiveLocalStream(this);
                    break;
                  case 'onReceiveRemoteStream':
                    listener.onReceiveRemoteStream(this);
                    break;
                  case 'onReceiveDtmfDigit':
                    listener.onReceiveDtmfDigit(this, data.dtmf);
                    break;
                  case 'onReceiveCallInfo':
                    listener.onReceiveCallInfo(this, data.data);
                    break;
                  case 'onHandleOnAnotherDevice':
                    listener.onHandleOnAnotherDevice(
                      this,
                      getSignalingState(data.code),
                      data.description,
                    );
                    break;
                  case 'onAudioDeviceChange':
                    listener.onAudioDeviceChange(
                      this,
                      getAudioDevice(data.selectedAudioDevice),
                      getListAudioDevice(data.availableAudioDevices),
                    );
                    break;
                }
              },
            );
          this.subscriptions.push(emitterSubscription);
          this.events.push(callEvents[Platform.OS][event]);
          RNStringeeCall.setNativeEvent(callEvents[Platform.OS][event]);
        }
      });
    }
  }

  /**
   * Unregister from listening to events from StringeeCall.
   * @function unregisterEvents
   */
  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }

    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeCall.removeNativeEvent(e));
    this.events = [];
  }

  /**
   * Make a call.
   * @function makeCall
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  makeCall(callback: RNStringeeEventCallback) {
    const makeCallParam = {
      from: this.from,
      to: this.to,
      isVideoCall: this.isVideoCall,
      customData: this.customData,
      videoResolution: this.videoResolution,
    };
    RNStringeeCall.makeCall(
      this.stringeeClient.uuid,
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

  /**
   * Initializes an answer. Must be implemented before you can answer a call.
   * @function initAnswer
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  initAnswer(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.initAnswer(this.stringeeClient.uuid, this.callId, callback);
  }

  /**
   * Answer a call.
   * @function answer
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  answer(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.answer(this.callId, callback);
  }

  /**
   * Hangup a call.
   * @function hangup
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  hangup(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.hangup(this.callId, callback);
  }

  /**
   * Reject a call.
   * @function reject
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  reject(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.reject(this.callId, callback);
  }

  /**
   * Sends a DTMF.
   * @function sendDTMF
   * @param {string} dtmf dtmf code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendDTMF(dtmf: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.sendDTMF(this.callId, dtmf, callback);
  }

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendCallInfo(callInfo: string, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.sendCallInfo(this.callId, callInfo, callback);
  }

  /**
   * Gets the call's statistics.
   * @function getCallStats
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getCallStats(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.getCallStats(
      this.stringeeClient.uuid,
      this.callId,
      callback,
    );
  }

  /**
   * Switches the device's camera.
   * @function switchCamera
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  switchCamera(callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.switchCamera(this.callId, callback);
  }

  /**
   * Enables or disables local video.
   * @function enableVideo
   * @param {boolean} enabled true - enables local video, false - disables local video
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  enableVideo(enabled: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.enableVideo(this.callId, enabled, callback);
  }

  /**
   * Toggles audio on or off.
   * @function mute
   * @param {boolean} mute true - toggles audio off, false - toggles audio on
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  mute(mute: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.mute(this.callId, mute, callback);
  }

  /**
   * Set the audio output mode.
   * @function setSpeakerphoneOn
   * @param {boolean} on true - loudspeaker, false - headset speaker
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  setSpeakerphoneOn(on: boolean, callback: RNStringeeEventCallback) {
    if (!callback) {
      callback = () => {};
    }
    RNStringeeCall.setSpeakerphoneOn(this.callId, on, callback);
  }

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
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
