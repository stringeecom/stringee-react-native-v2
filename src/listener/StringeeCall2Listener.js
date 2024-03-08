import {
  AudioDevice,
  MediaState,
  MediaType,
  SignalingState,
  StringeeCall2,
  StringeeVideoTrack,
} from '../../index';

class StringeeCall2Listener {
  /**
   * Invoked when the call's state changes between: calling, ringing, answered, busy, ended.
   * @function onChangeSignalingState
   * @param {StringeeCall2} stringeeCall2
   * @param {SignalingState} signalingState The signaling state of the call
   * @param {string} reason The description of the state
   * @param {number} sipCode The sip code returned when the call is an app-to-phone call
   * @param {string} sipReason The description of sip code
   */
  onChangeSignalingState: (
    stringeeCall2: StringeeCall2,
    signalingState: SignalingState,
    reason: string,
    sipCode: number,
    sipReason: string,
  ) => void;
  /**
   * Invoked when the call media state changes between: connected, disconnected.
   * @function onChangeMediaState
   * @param {StringeeCall2} stringeeCall2
   * @param {MediaState} mediaState The media state of the call
   * @param {string} description The description of the state
   */
  onChangeMediaState: (
    stringeeCall2: StringeeCall2,
    mediaState: MediaState,
    description: string,
  ) => void;
  /**
   * Invoked when the local track is initialized and available to be rendered to a view.
   * @function onReceiveLocalTrack
   * @param {StringeeCall2} stringeeCall2
   * @param {StringeeVideoTrack} stringeeVideoTrack
   */
  onReceiveLocalTrack: (
    stringeeCall2: StringeeCall2,
    stringeeVideoTrack: StringeeVideoTrack,
  ) => void;
  /**
   * Invoked when the remote track is initialized and available to be rendered to a view.
   * @function onReceiveRemoteTrack
   * @param {StringeeCall2} stringeeCall2
   * @param {StringeeVideoTrack} stringeeVideoTrack
   */
  onReceiveRemoteTrack: (
    stringeeCall2: StringeeCall2,
    stringeeVideoTrack: StringeeVideoTrack,
  ) => void;
  /**
   * Invoked when the call receives a DTMF.
   * @function onReceiveDtmfDigit
   * @param {StringeeCall2} stringeeCall2
   * @param {string} dtmf DTMF code ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", #)
   */
  onReceiveDtmfDigit: (stringeeCall2: StringeeCall2, dtmf: string) => void;
  /**
   * Invoked when you receive info from another client.
   * @function onReceiveCallInfo
   * @param {StringeeCall2} stringeeCall2
   * @param {string} callInfo Data received in JSON string format
   */
  onReceiveCallInfo: (stringeeCall2: StringeeCall2, callInfo: string) => void;
  /**
   * Invoked when the call is implemented on another device.
   * @function onHandleOnAnotherDevice
   * @param {StringeeCall2} stringeeCall2
   * @param {SignalingState} signalingState The signaling state of the call
   * @param {string} description The description of the state
   */
  onHandleOnAnotherDevice: (
    stringeeCall2: StringeeCall2,
    signalingState: SignalingState,
    description: string,
  ) => void;
  /**
   * Invoked when device change audio device.
   * This event only invoked in android.
   * @function onAudioDeviceChange
   * @param {StringeeCall2} stringeeCall2
   * @param {AudioDevice} selectedAudioDevice Audio device was selected
   * @param {Array<AudioDevice>} availableAudioDevices List available  audio devices on your android device
   */
  onAudioDeviceChange: (
    stringeeCall2: StringeeCall2,
    selectedAudioDevice: AudioDevice,
    availableAudioDevices: Array<AudioDevice>,
  ) => void;
  /**
   * Invoked when other user send event change track media state.
   * @function onTrackMediaStateChange
   * @param {StringeeCall2} stringeeCall2
   * @param {string} from Id of user who send
   * @param {MediaType} mediaType Type of media
   * @param {boolean} enable State of media. true - on, false - off
   */
  onTrackMediaStateChange: (
    stringeeCall2: StringeeCall2,
    from: string,
    mediaType: MediaType,
    enable: boolean,
  ) => void;
}

export {StringeeCall2Listener};
