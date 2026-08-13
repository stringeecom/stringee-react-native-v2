import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {
  callEvents,
  getAudioDevice,
  getListAudioDevice,
  getMediaState,
  getSignalingState,
  isAndroid,
  isIOS,
  normalCallbackHandle,
  stringeeCallEvents,
  CallType,
  VideoResolution,
} from '../helpers/StringeeHelper';
import type {StringeeNativeModule} from '../helpers/StringeeHelper';
import {StringeeError} from '../helpers/StringeeError';
import type {StringeeCallListener} from '../listener/StringeeCallListener';
import type {StringeeClient} from '../StringeeClient';

const RNStringeeCall =
  NativeModules.RNStringeeCall as StringeeNativeModule;

type EventSubscription = {remove(): void};

export interface StringeeCallOptions {
  /** Connected client that owns the call. */
  stringeeClient: StringeeClient;
  /** Caller user ID or phone number. */
  from: string;
  /** Callee user ID or phone number. */
  to: string;
  /** Existing native wrapper UUID; reserved for incoming calls created by the SDK. */
  uuid?: string;
}

/**
 * Controls a first-generation one-to-one Stringee audio or video call.
 * Incoming instances are delivered by `StringeeClientListener.onIncomingCall`.
 */
class StringeeCall {
  stringeeClient: StringeeClient;
  callId!: string;
  customData!: string;
  from: string;
  fromAlias!: string;
  to: string;
  toAlias!: string;
  callType!: CallType;
  isVideoCall: boolean = false;
  videoResolution: VideoResolution = VideoResolution.normal;
  serial!: number;
  uuid: string;
  canAnswer: boolean;
  private eventEmitter: NativeEventEmitter;
  private events: string[];
  private subscriptions: EventSubscription[];

  /**
   * Create the StringeeCall.
   * @param {StringeeClient} props.stringeeClient StringeeClient used to connect to the Stringee server
   * @param {string} props.from From number
   * @param {string} props.to To number
   */
  constructor(props: StringeeCallOptions) {
    this.stringeeClient = props.stringeeClient;

    if (props.uuid) {
      this.uuid = props.uuid;
    } else {
      this.uuid =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

      RNStringeeCall.createWrapper(this.uuid, this.stringeeClient.uuid);
    }
    this.canAnswer = false;
    this.from = props.from;
    this.to = props.to;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall as never);
  }

  /**
   * Set listener for StringeeCall.
   * @function setListener
   * @param {StringeeCallListener} listener
   */
  setListener(listener?: StringeeCallListener | null): void {
    this.unregisterEvents();

    if (listener) {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      stringeeCallEvents.forEach(event => {
        const eventName = callEvents[platform][event];
        if (
          (listener as unknown as Record<string, unknown>)[event] &&
          eventName
        ) {
          const emitterSubscription: EventSubscription =
              this.eventEmitter.addListener(
                  eventName,
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
                        listener.onChangeSignalingState?.(
                            this,
                            getSignalingState(data.code),
                            data.reason,
                            data.sipCode,
                            data.sipReason,
                        );
                        break;
                      case 'onChangeMediaState':
                        listener.onChangeMediaState?.(
                            this,
                            getMediaState(data.code),
                            data.description,
                        );
                        break;
                      case 'onReceiveLocalStream':
                        listener.onReceiveLocalStream?.(this);
                        break;
                      case 'onReceiveRemoteStream':
                        listener.onReceiveRemoteStream?.(this);
                        break;
                      case 'onReceiveDtmfDigit':
                        listener.onReceiveDtmfDigit?.(this, data.dtmf);
                        break;
                      case 'onReceiveCallInfo':
                        listener.onReceiveCallInfo?.(this, data.data);
                        break;
                      case 'onHandleOnAnotherDevice':
                        listener.onHandleOnAnotherDevice?.(
                            this,
                            getSignalingState(data.code),
                            data.description,
                        );
                        break;
                      case 'onAudioDeviceChange':
                        listener.onAudioDeviceChange?.(
                            this,
                            getAudioDevice(data.selectedAudioDevice),
                            getListAudioDevice(data.availableAudioDevices),
                        );
                        break;
                    }
                  },
              );
          this.subscriptions.push(emitterSubscription);
          this.events.push(eventName);
          RNStringeeCall.setNativeEvent(this.uuid, eventName);
        }
      });
    }
  }

  /**
   * Unregister from listening to events from StringeeCall.
   * @function unregisterEvents
   */
  unregisterEvents(): void {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }

    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeCall.removeNativeEvent(this.uuid, e));
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
          this.uuid,
          JSON.stringify(makeCallParam),
          (
            status: boolean,
            code: number,
            message: string,
            callId: string,
            _customData: string,
          ) => {
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
      RNStringeeCall.initAnswer(
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
        RNStringeeCall.answer(
          this.uuid,
          (status: boolean, code: number, message: string) => {
          if (status) {
            resolve();
          } else {
            this.canAnswer = true;
            reject(new StringeeError(code, message, 'answer'));
          }
          },
        );
      } else {
        reject(new StringeeError(-9, 'Encountered an error while processing your request', 'answer'));
      }
    });
  }

  /**
   * Hangup a call.
   * @function hangup
   */
  hangup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      RNStringeeCall.hangup(
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
      RNStringeeCall.reject(
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
      RNStringeeCall.sendDTMF(
          this.uuid,
          dtmf,
          normalCallbackHandle(resolve, reject, 'sendDTMF'),
      );
    });
  }

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   */
  sendCallInfo(callInfo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.sendCallInfo(
          this.uuid,
          callInfo,
          normalCallbackHandle(resolve, reject, 'sendCallInfo'),
      );
    });
  }

  /**
   * Gets the call's statistics.
   * @function getCallStats
   */
  getCallStats(): Promise<string> {
    return new Promise((resolve, reject) => {
      RNStringeeCall.getCallStats(this.uuid, (
        status: boolean,
        code: number,
        message: string,
        data: string,
      ) => {
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
      RNStringeeCall.switchCamera(
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
      RNStringeeCall.enableVideo(
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
    return new Promise<void>((resolve, reject) => {
      RNStringeeCall.mute(
          this.uuid,
          mute,
          normalCallbackHandle(resolve, reject, 'mute'),
      );
    });
  }

  /**
   * Set the audio output mode.
   * @function setSpeakerphoneOn
   * @param {boolean} on true - loudspeaker, false - headset speaker
   */
  setSpeakerphoneOn(on: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      RNStringeeCall.setSpeakerphoneOn(
          this.uuid,
          on,
          normalCallbackHandle(resolve, reject, 'setSpeakerphoneOn'),
      );
    });
  }

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   */
  resumeVideo(): Promise<void | StringeeError> {
    return new Promise<void | StringeeError>((resolve, reject) => {
      if (!isAndroid) {
        resolve(
            new StringeeError(
                -10,
                'This function only for android',
                'resumeVideo',
            ),
        );
      } else {
        RNStringeeCall.resumeVideo(
          this.uuid,
          (status: boolean, code: number, message: string) => {
          if (status) {
            resolve();
          } else {
            reject(new StringeeError(code, message, 'resumeVideo'));
          }
          },
        );
      }
    });
  }

  generateUUID(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!isIOS) {
        reject(
            new StringeeError(-10, 'This function only for ios', 'generateUUID'),
        );
      } else {
        RNStringeeCall.generateUUID(
          this.callId,
          this.serial ?? 1,
          (uuid: string) => {
          resolve(uuid);
          },
        );
      }
    });
  }

  clean(): void {
    RNStringeeCall.clean(this.uuid);
  }
}
export {StringeeCall};
