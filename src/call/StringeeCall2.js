import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import {
  callEvents,
  genUUID,
  getMediaState,
  getMediaType,
  getSignalingState,
  isAndroid,
  isIOS,
  normalCallbackHandle,
  stringeeCall2Events,
} from '../helpers/StringeeHelper';
import {
  CallType,
  StringeeCall2Listener,
  StringeeClient,
  StringeeError,
  StringeeVideoTrack,
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
  serial: number;
  uuid: string;
  canAnswer: Boolean;

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
    if (props.uuid) {
      this.uuid = props.uuid;
    } else {
      // Gen UUID to create a unique identifier for this call instance and create a wrapper object in native code
      this.uuid = genUUID();

      RNStringeeCall2.createWrapper(this.uuid, this.stringeeClient.uuid);
    }
    this.from = props.from;
    this.to = props.to;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall2);
    this.canAnswer = false;
  }

  /**
   * Set listener for StringeeCall2.
   * @function setListener
   * @param {StringeeCall2Listener} listener
   */
  setListener(listener: StringeeCall2Listener) {
    this.unregisterEvents();

    if (listener) {
      stringeeCall2Events.forEach(event => {
        if (listener[event] && callEvents[Platform.OS][event]) {
          let emitterSubscription: EmitterSubscription =
            this.eventEmitter.addListener(
              callEvents[Platform.OS][event],
              ({uuid, data}) => {
                if (uuid !== this.uuid) {
                  return;
                }
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
                  case 'onReceiveLocalTrack':
                    listener.onReceiveLocalTrack(
                      this,
                      new StringeeVideoTrack(data.videoTrack),
                    );
                    break;
                  case 'onReceiveRemoteTrack':
                    listener.onReceiveRemoteTrack(
                      this,
                      new StringeeVideoTrack(data.videoTrack),
                    );
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
          RNStringeeCall2.setNativeEvent(
            this.uuid,
            callEvents[Platform.OS][event],
          );
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

    this.events.forEach(e => RNStringeeCall2.removeNativeEvent(this.uuid, e));
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
        this.uuid,
        JSON.stringify(makeCallParam),
        (status, code, message, callId, customData) => {
          this.callId = callId;
          if (status) {
            resolve();
          } else {
            reject(new StringeeError(code, message, 'makeCall'));
          }
        },
      );
    });
  }

  /**
   * Initializes an answer. Must be implemented before you can answer a call.
   * @function initAnswer
   */
  initAnswer(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.initAnswer(
        this.uuid,
        normalCallbackHandle(resolve, reject, 'initAnswer'),
      );
    });
  }

  /**
   * Answer a call.
   * @function answer
   */
  answer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.canAnswer) {
        this.canAnswer = false;
        RNStringeeCall2.answer(
          this.uuid,
          this.videoResolution,
          (status, code, message) => {
            if (status) {
              resolve();
            } else {
              this.canAnswer = true;
              reject(new StringeeError(code, message, 'answer'));
            }
          },
        );
      } else {
        reject(
          new StringeeError(
            -9,
            'Encountered an error while processing your request',
            'answer',
          ),
        );
      }
    });
  }

  /**
   * Hangup a call.
   * @function hangup
   */
  hangup(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.hangup(
        this.uuid,
        normalCallbackHandle(resolve, reject, 'hangup'),
      );
    });
  }

  /**
   * Reject a call.
   * @function reject
   */
  reject(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.reject(
        this.uuid,
        normalCallbackHandle(resolve, reject, 'reject'),
      );
    });
  }

  /**
   * Sends a DTMF.
   * @function sendDTMF
   * @param {string} dtmf dtmf code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   */
  sendDTMF(dtmf: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.sendDTMF(
        this.uuid,
        dtmf,
        normalCallbackHandle(resolve, reject, 'sendDTMF'),
      );
    });
  }

  /**
   * Gets the call's statistics.
   * @function getCallStats
   */
  getCallStats(): Promise<string> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.getCallStats(this.uuid, (status, code, message, data) => {
        if (status) {
          resolve(data);
        } else {
          reject(new StringeeError(code, message, 'getCallStats'));
        }
      });
    });
  }

  /**
   * Switches the device's camera.
   * @function switchCamera
   */
  switchCamera(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.switchCamera(
        this.uuid,
        normalCallbackHandle(resolve, reject, 'switchCamera'),
      );
    });
  }

  /**
   * Enables or disables local video.
   * @function enableVideo
   * @param {boolean} enabled true - enables local video, false - disables local video
   */
  enableVideo(enabled: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.enableVideo(
        this.uuid,
        enabled,
        normalCallbackHandle(resolve, reject, 'enableVideo'),
      );
    });
  }

  /**
   * Toggles audio on or off.
   * @function mute
   * @param {boolean} mute true - toggles audio off, false - toggles audio on
   */
  mute(mute: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.mute(
        this.uuid,
        mute,
        normalCallbackHandle(resolve, reject, 'mute'),
      );
    });
  }

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   */
  resumeVideo(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isAndroid) {
        reject(
          new StringeeError(
            -10,
            'This function only for android',
            'resumeVideo',
          ),
        );
      } else {
        RNStringeeCall2.resumeVideo(this.uuid, (status, code, message) => {
          if (status) {
            resolve();
          } else {
            reject(new StringeeError(code, message, 'resumeVideo'));
          }
        });
      }
    });
  }

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   */
  sendCallInfo(callInfo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.sendCallInfo(
        this.uuid,
        callInfo,
        normalCallbackHandle(resolve, reject, 'sendCallInfo'),
      );
    });
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
        this.uuid,
        autoSendTrackMediaStateChangeEvent,
        normalCallbackHandle(
          resolve,
          reject,
          'setAutoSendTrackMediaStateChangeEvent',
        ),
      );
    });
  }

  generateUUID(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!isIOS) {
        reject(
          new StringeeError(-10, 'This function only for ios', 'generateUUID'),
        );
      } else {
        RNStringeeCall2.generateUUID(this.callId, this.serial ?? 1, uuid => {
          resolve(uuid);
        });
      }
    });
  }

  clean() {
    RNStringeeCall2.clean(this.uuid);
  }
}
export {StringeeCall2};
