import {genUUID} from '../helpers/StringeeHelper';
import type {AudioDevice} from '../helpers/AudioDevice';

class StringeeAudioListener {
  constructor() {
    // Gen UUID to create a unique identifier for this listener instance
    this._key = genUUID();
  }

  get key() {
    return this._key;
  }

  /**
   * Invoked when a device changes an audio device.
   * @function onAudioDeviceChange
   * @param {AudioDevice} selectedAudioDevice Audio device was selected
   * @param {Array<AudioDevice>} availableAudioDevices List available audio devices on your android device
   */
  onAudioDeviceChange: (
    selectedAudioDevice: AudioDevice,
    availableAudioDevices: Array<AudioDevice>,
  ) => void;
}

export {StringeeAudioListener};
