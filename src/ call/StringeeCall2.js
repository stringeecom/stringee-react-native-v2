import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {
  callEvents,
  getAudioDevice,
  getListAudioDevice,
  getMediaState,
  getMediaType,
  getSignalingState,
  stringeeCall2Events,
} from '../helpers/StringeeHelper';
import {
  CallType,
  StringeeCall2Listener,
  StringeeClient,
  VideoResolution,
} from '../../index';

const RNStringeeCall2 = NativeModules.RNStringeeCall2;

class StringeeCall2 {
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
   * Create the StringeeCall2.
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
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall2);
  }

  /**
   * Register to listen to events from StringeeCall2.
   * @function registerEvents
   * @param {StringeeCall2Listener} listener
   */
  registerEvents(listener: StringeeCall2Listener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (listener) {
      stringeeCall2Events.forEach(event => {
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
                  case 'onTrackMediaStateChange':
                    listener.onTrackMediaStateChange(
                      this,
                      data.from,
                      getMediaType(data.mediaType),
                      data.enable,
                    );
                    break;
                }
              },
            );
          this.subscriptions.push(emitterSubscription);
          this.events.push(callEvents[Platform.OS][event]);
          RNStringeeCall2.setNativeEvent(callEvents[Platform.OS][event]);
        }
      });
    }
  }

  /**
   * Unregister from listening to events from StringeeCall2.
   * @function unregisterEvents
   */
  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }

    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeCall2.removeNativeEvent(e));
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
    RNStringeeCall2.makeCall(
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
    RNStringeeCall2.initAnswer(this.stringeeClient.uuid, this.callId, callback);
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
    RNStringeeCall2.answer(this.callId, callback);
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
    RNStringeeCall2.hangup(this.callId, callback);
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
    RNStringeeCall2.reject(this.callId, callback);
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
    RNStringeeCall2.sendDTMF(this.callId, dtmf, callback);
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
    RNStringeeCall2.getCallStats(
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
    RNStringeeCall2.switchCamera(this.callId, callback);
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
    RNStringeeCall2.enableVideo(this.callId, enabled, callback);
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
    RNStringeeCall2.mute(this.callId, mute, callback);
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
    RNStringeeCall2.setSpeakerphoneOn(this.callId, on, callback);
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
      RNStringeeCall2.resumeVideo(this.callId, callback);
    }
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
    RNStringeeCall2.sendCallInfo(this.callId, callInfo, callback);
  }

  /**
   * Set auto send track media state change to another client.
   * @function setAutoSendTrackMediaStateChangeEvent
   * @param {boolean} autoSendTrackMediaStateChangeEvent true - auto send, false - not auto send
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
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

  generateUUID(callback) {
    if (!callback) {
      callback = () => {};
    }
    const platform = Platform.OS;
    if (platform !== 'ios') {
      console.warn('generateUUID only for ios');
    }
    RNStringeeCall2.generateUUID(this.callId, this.serial, callback);
  }
}
export {StringeeCall2};
