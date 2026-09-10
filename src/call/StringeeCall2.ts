import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {
  callEvents,
  getAudioDevice,
  getListAudioDevice,
  getMediaState,
  getMediaType,
  getSignalingState,
  isAndroid,
  isIOS,
  normalCallbackHandle,
  stringeeCall2Events,
  CallType,
  VideoResolution,
} from '../helpers/StringeeHelper';
import type {StringeeNativeModule} from '../helpers/StringeeHelper';
import {StringeeError} from '../helpers/StringeeError';
import type {StringeeCall2Listener} from '../listener/StringeeCall2Listener';
import type {StringeeClient} from '../StringeeClient';
import {StringeeVideoTrack} from '../video/StringeeVideoTrack';

const RNStringeeCall2 =
  NativeModules.RNStringeeCall2 as StringeeNativeModule;

type EventSubscription = {remove(): void};

export interface StringeeCall2Options {
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
 * Controls a track-based one-to-one Stringee audio or video call.
 * Local and remote video arrive as `StringeeVideoTrack` objects.
 */
class StringeeCall2 {
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
   * Create the StringeeCall2.
   * @param {StringeeClient} props.stringeeClient StringeeClient used to connect to the Stringee server
   * @param {string} props.from From number
   * @param {string} props.to To number
   */
  constructor(props: StringeeCall2Options) {
    this.stringeeClient = props.stringeeClient;
    if (props.uuid) {
      this.uuid = props.uuid;
    } else {
      this.uuid =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

      RNStringeeCall2.createWrapper(this.uuid, this.stringeeClient.uuid);
    }
    this.from = props.from;
    this.to = props.to;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeCall2 as never);
    this.canAnswer = false;
  }

  /**
   * Set listener for StringeeCall2.
   * @function setListener
   * @param {StringeeCall2Listener} listener
   */
  setListener(listener?: StringeeCall2Listener | null): void {
    this.unregisterEvents();

    if (listener) {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      stringeeCall2Events.forEach(event => {
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
                      case 'onReceiveLocalTrack':
                        listener.onReceiveLocalTrack?.(
                            this,
                            new StringeeVideoTrack(data.videoTrack),
                        );
                        break;
                      case 'onReceiveRemoteTrack':
                        listener.onReceiveRemoteTrack?.(
                            this,
                            new StringeeVideoTrack(data.videoTrack),
                        );
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
                      case 'onTrackMediaStateChange':
                        listener.onTrackMediaStateChange?.(
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
          this.events.push(eventName);
          RNStringeeCall2.setNativeEvent(this.uuid, eventName);
        }
      });
    }
  }

  /**
   * Unregister from listening to events from StringeeCall2.
   * @function unregisterEvents
   */
  unregisterEvents(): void {
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
      RNStringeeCall2.getCallStats(this.uuid, (
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
   * Set the audio output mode.
   * @function setSpeakerphoneOn
   * @param {boolean} on true - loudspeaker, false - headset speaker
   */
  setSpeakerphoneOn(on: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeCall2.setSpeakerphoneOn(
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
        RNStringeeCall2.resumeVideo(
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
        RNStringeeCall2.generateUUID(
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
    RNStringeeCall2.clean(this.uuid);
  }
}
export {StringeeCall2};
