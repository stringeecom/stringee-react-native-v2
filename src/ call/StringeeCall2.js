import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {
  StringeeError,
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
      RNStringeeCall2.makeCall(
        this.stringeeClient.uuid,
        JSON.stringify(makeCallParam),
        (status, code, message, callId, customData) => {
          this.callId = callId;
          if (status) {
            resolve();
          }else {
            reject(new StringeeError(code, message));
          };
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
      RNStringeeCall2.initAnswer(this.stringeeClient.uuid, this.callId, (status, code, message) => {
        if (status) {
          resolve();
        }else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Answer a call.
   * @function answer
   */
  answer(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.answer(this.callId, (status, code, message) => {
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
  hangup(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.hangup(this.callId, (status, code, message) => {
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
      RNStringeeCall2.reject(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        } else {
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
      RNStringeeCall2.sendDTMF(this.callId, dtmf, (status, code, message) => {
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
  getCallStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.getCallStats(
        this.stringeeClient.uuid,
        this.callId,
        (status, code, message) => {
          if (status) {
            resolve();
          } else {
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
      RNStringeeCall2.switchCamera(this.callId, (status, code, message) => {
        if (status) {
          resolve();
        } else {
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
      RNStringeeCall2.enableVideo(this.callId, enabled, (status, code, message) => {
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
  mute(mute: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.mute(this.callId, mute, (status, code, message) => {
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
  setSpeakerphoneOn(on: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.setSpeakerphoneOn(this.callId, on, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  resumeVideo(): Promise<void> {
    return new Promise((resolve, reject) => {
      const platform = Platform.OS;
      if (platform === 'ios') {
        reject(new StringeeError(-10, 'this function only for android'))
      } else {
        RNStringeeCall2.resumeVideo(this.callId, (status, code, message) => {
          if (status) {
            resolve();
          }else {
            reject(new StringeeError(code, message));
          }
        });
      }
    })
  }

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   */
  sendCallInfo(callInfo: string): Promise<void>  {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.sendCallInfo(this.callId, callInfo, (status, code, message) => {
        if (status) {
          resolve();
        } else {
          reject(new StringeeError(code, message));
        }
      });
    })
  }

  /**
   * Set auto send track media state change to another client.
   * @function setAutoSendTrackMediaStateChangeEvent
   * @param {boolean} autoSendTrackMediaStateChangeEvent true - auto send, false - not auto send
   */
  setAutoSendTrackMediaStateChangeEvent(
    autoSendTrackMediaStateChangeEvent: boolean,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.setAutoSendTrackMediaStateChangeEvent(
        this.callId,
        autoSendTrackMediaStateChangeEvent,
        (status, code, message) => {
          if (status) {
            resolve();
          } else {
            reject(new StringeeError(code, message));
          }
        },
      );
    })
    
  }

  generateUUID(): Promise<string> {
    return new Promise((resolve, reject) => {
      const platform = Platform.OS;
      if (platform !== 'ios') {
        reject(new StringeeError(-10, 'this function only for ios'));
      }else {
        RNStringeeCall2.generateUUID(this.callId, this.serial ?? 1, (uuid => {
          resolve(uuid);
        }));
      }
    })
  }
}
export {StringeeCall2};
