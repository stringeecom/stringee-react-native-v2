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
  getSignalingState,
  stringeeCallEvents,
  StringeeError
} from '../helpers/StringeeHelper';
import {
  CallType,
  StringeeCallListener,
  StringeeClient,
  VideoResolution,
} from '../../index';

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
  serial: number;

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
        if (listener[event] && callEvents[Platform.OS][event]) {
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
   */
  makeCall(): Promise<void> {
    const makeCallParam = {
      from: this.from,
      to: this.to,
      isVideoCall: this.isVideoCall,
      customData: this.customData,
      videoResolution: this.videoResolution,
    };
    return new Promise((resolve, reject) => {
      RNStringeeCall.makeCall(
        this.stringeeClient.uuid,
        JSON.stringify(makeCallParam),
        (status, code, message, callId, customData) => {
          this.callId = callId;
          if (status) {
            resolve();
          }else {
            reject(new StringeeError(code, message));
          }
        },
      );
    })
    
  }

  /**
   * Initializes an answer. Must be implemented before you can answer a call.
   * @function initAnswer
   */
  initAnswer(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.initAnswer(this.stringeeClient.uuid, this.callId, ((status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      }));
    })
  }

  /**
   * Answer a call.
   * @function answer
   */
  answer(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.answer(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Hangup a call.
   * @function hangup
   */
  hangup() {
    return new Promise((resolve, reject) => {
      RNStringeeCall.hangup(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Reject a call.
   * @function reject
   */
  reject(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.reject(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        }else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Sends a DTMF.
   * @function sendDTMF
   * @param {string} dtmf dtmf code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   */
  sendDTMF(dtmf: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.sendDTMF(this.callId, dtmf, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   */
  sendCallInfo(callInfo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.sendCallInfo(this.callId, callInfo, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Gets the call's statistics.
   * @function getCallStats
   */
  getCallStats(): Promise<string> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.getCallStats(
        this.stringeeClient.uuid,
        this.callId,
        (status, code, message, data) => {
          if (status) {
            resolve(data);
          }else {
            reject(new StringeeError(code, message));
          }
        },
      );
    })
  }

  /**
   * Switches the device's camera.
   * @function switchCamera
   */
  switchCamera(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.switchCamera(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        }else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Enables or disables local video.
   * @function enableVideo
   * @param {boolean} enabled true - enables local video, false - disables local video
   */
  enableVideo(enabled: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.enableVideo(this.callId, enabled, (status, code, message) => {
        if (status) {
          resolve();
        }else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Toggles audio on or off.
   * @function mute
   * @param {boolean} mute true - toggles audio off, false - toggles audio on
   */
  mute(mute: boolean) {
    return new Promise((resolve, reject) => {
      RNStringeeCall.mute(this.callId, mute, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Set the audio output mode.
   * @function setSpeakerphoneOn
   * @param {boolean} on true - loudspeaker, false - headset speaker
   */
  setSpeakerphoneOn(on: boolean) {
    return new Promise((resolve, reject) => {
      RNStringeeCall.setSpeakerphoneOn(this.callId, on, (status, code, messgae) => {
        if (status) {
          resolve();
        }else {
          reject(new StringeeError(code, messgae));
        }
      });
    })
  }

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   */
  resumeVideo(): Promise<void> {
    return new Promive((resolve, reject) => {
      const platform = Platform.OS;
      if (platform === 'ios') {
        resolve(new StringeeError(-10,'this function only for android'));
      } else {
        RNStringeeCall.resumeVideo(this.callId, (status, code, message) => {
          if (status) {
            resolve();
          }else {
            reject(new StringeeError(code, message));
          }
        });
      }
    })
  }

  generateUUID(): Promise<string> {
    return new Promise((resolve, reject) => {
      const platform = Platform.OS;
      if (platform !== 'ios') {
        reject( new StringeeError(-10, 'this function only for ios'));
      }else {
        RNStringeeCall.generateUUID(this.callId, this.serial ?? 1, (uuid => {
          resolve(uuid);
        }));
      }
    })
  }

}
export {StringeeCall};
