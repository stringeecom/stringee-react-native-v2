export class StringeeCallListener {
  /**
   * Invoked when the call's state changes between: calling, ringing, answered, busy, ended.
   * @function onChangeSignalingState
   * @param {StringeeCall} stringeeCall
   * @param {SignalingState} signalingState The signaling state of the call
   * @param {string} reason The description of the state
   * @param {number} sipCode The sip code returned when the call is an app-to-phone call
   * @param {string} sipReason The description of sip code
   */
  onChangeSignalingState: (stringeeCall: StringeeCall, signalingState: SignalingState, reason: string, sipCode: number, sipReason: string) => void;
  /**
   * Invoked when the call media state changes between: connected, disconnected.
   * @function onChangeMediaState
   * @param {StringeeCall} stringeeCall
   * @param {MediaState} mediaState The media state of the call
   * @param {string} description The description of the state
   */
  onChangeMediaState: (stringeeCall: StringeeCall, mediaState: MediaState, description: string) => void;
  /**
   * Invoked when the local stream is initialized and available to be rendered to a view.
   * @function onReceiveLocalStream
   * @param {StringeeCall} stringeeCall
   */
  onReceiveLocalStream: (stringeeCall: StringeeCall) => void;
  /**
   * Invoked when the remote stream is initialized and available to be rendered to a view.
   * @function onReceiveRemoteStream
   * @param {StringeeCall} stringeeCall
   */
  onReceiveRemoteStream: (stringeeCall: StringeeCall) => void;
  /**
   * Invoked when the call receives a DTMF.
   * @function onReceiveDtmfDigit
   * @param {StringeeCall} stringeeCall
   * @param {string} dtmf DTMF code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   */
  onReceiveDtmfDigit: (stringeeCall: StringeeCall, dtmf: string) => void;
  /**
   * Invoked when you receive info from another client.
   * @function onReceiveCallInfo
   * @param {StringeeCall} stringeeCall
   * @param {string} callInfo Data received in JSON string format
   */
  onReceiveCallInfo: (stringeeCall: StringeeCall, callInfo: string) => void;
  /**
   * Invoked when the call is implemented on another device.
   * @function onHandleOnAnotherDevice
   * @param {StringeeCall} stringeeCall
   * @param {SignalingState} signalingState The signaling state of the call
   * @param {string} description The description of the state
   */
  onHandleOnAnotherDevice: (stringeeCall: StringeeCall, signalingState: SignalingState, description: string) => void;
  /**
   * Invoked when device change audio device.
   * This event only invoked in android.
   * @function onAudioDeviceChange
   * @param {StringeeCall} stringeeCall
   * @param {AudioDevice} selectedAudioDevice Audio device was selected
   * @param {Array<AudioDevice>} availableAudioDevices List available audio devices on your android device
   */
  onAudioDeviceChange: (stringeeCall: StringeeCall, selectedAudioDevice: AudioDevice, availableAudioDevices: Array<AudioDevice>) => void;
}

import { AudioDevice, MediaState, SignalingState, StringeeCall } from "../../../index";
