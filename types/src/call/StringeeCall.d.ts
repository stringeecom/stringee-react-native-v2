export class StringeeCall {
  /**
   * Create the StringeeCall.
   * @param {StringeeClient} props.stringeeClient StringeeClient used to connect to the Stringee server
   * @param {string} props.from From number
   * @param {string} props.to To number
   */
  constructor(props?: {
    stringeeClient: StringeeClient;
    from: string;
    to: string;
  });

  stringeeClient: StringeeClient;
  callId: string;
  customData: string;
  from: string;
  fromAlias: string;
  to: string;
  toAlias: string;
  callType: CallType;
  isVideoCall: boolean;
  videoResolution: VideoResolution;
  serial: number;
  uuid: string;
  canAnswer: Boolean;

  /**
   * Set listener for StringeeCall.
   * @function setListener
   * @param {StringeeCallListener} listener
   */
  setListener(listener: StringeeCallListener): void;

  /**
   * Unregister from listening to events from StringeeCall.
   * @function unregisterEvents
   */
  unregisterEvents(): void;

  /**
   * Make a call.
   * @function makeCall
   */
  makeCall(): Promise<void>;

  /**
   * Initializes an answer. Must be implemented before you can answer a call.
   * @function initAnswer
   */
  initAnswer(): Promise<void>;

  /**
   * Answer a call.
   * @function answer
   */
  answer(): Promise<void>;

  /**
   * Hangup a call.
   * @function hangup
   */
  hangup(): Promise<any>;

  /**
   * Reject a call.
   * @function reject
   */
  reject(): Promise<void>;

  /**
   * Sends a DTMF.
   * @function sendDTMF
   * @param {string} dtmf dtmf code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   */
  sendDTMF(dtmf: string): Promise<void>;

  /**
   * Send info to another client.
   * @function sendCallInfo
   * @param {string} callInfo data you want to send, in JSON string
   */
  sendCallInfo(callInfo: string): Promise<void>;

  /**
   * Gets the call's statistics.
   * @function getCallStats
   */
  getCallStats(): Promise<string>;

  /**
   * Switches the device's camera.
   * @function switchCamera
   */
  switchCamera(): Promise<void>;

  /**
   * Enables or disables local video.
   * @function enableVideo
   * @param {boolean} enabled true - enables local video, false - disables local video
   */
  enableVideo(enabled: boolean): Promise<void>;

  /**
   * Toggles audio on or off.
   * @function mute
   * @param {boolean} mute true - toggles audio off, false - toggles audio on
   */
  mute(mute: boolean): Promise<any>;

  /**
   * Set the audio output mode.
   * @function setSpeakerphoneOn
   * @param {boolean} on true - loudspeaker, false - headset speaker
   */
  setSpeakerphoneOn(on: boolean): Promise<any>;

  /**
   * Only for android.
   * Resume local stream.
   * @function resumeVideo
   */
  resumeVideo(): Promise<void>;

  generateUUID(): Promise<string>;

  clean(): void;
}

import { CallType, StringeeCallListener, StringeeClient, VideoResolution } from "../../index";
