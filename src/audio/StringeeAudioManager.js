import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import {
  normalCallbackHandle,
  stringeeAudioEvents,
} from '../helpers/StringeeHelper';
import { AudioDevice, StringeeAudioListener, StringeeError } from '../../index';

const RNStringeeAudio = NativeModules.RNStringeeAudio;

class StringeeAudioManager {
  static _instance = null;
  _selectedAudioDevice: AudioDevice;
  _availableAudioDevices: Array<AudioDevice> = [];
  _listeners: Array<StringeeAudioListener> = [];

  /**
   * Create the StringeeAudioManager.
   */
  constructor() {
    if (StringeeAudioManager._instance) {
      return StringeeAudioManager._instance;
    }

    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeAudio);

    StringeeAudioManager._instance = this;
  }

  /**
   * Get the singleton instance of StringeeAudioManager.
   */
  static getInstance() {
    if (!StringeeAudioManager._instance) {
      StringeeAudioManager._instance = new StringeeAudioManager();
    }
    return StringeeAudioManager._instance;
  }

  /**
   * Get the currently selected audio device.
   * @returns {AudioDevice}
   */
  get selectedAudioDevice(): AudioDevice {
    return this._selectedAudioDevice;
  }

  /**
   * Get the list of available audio devices.
   * @returns {Array<AudioDevice>}
   */
  get availableAudioDevices(): Array<AudioDevice> {
    return this._availableAudioDevices;
  }

  /**
   * Add a listener to the StringeeAudioManager.
   * @param listener
   */
  addListener(listener: StringeeAudioListener): void {
    this._listeners.push(listener);
  }

  /**
   * Remove a listener from the StringeeAudioManager.
   * @param listener
   */
  removeListener(listener: StringeeAudioListener): void {
    this._listeners = this._listeners.filter(e => e.key !== listener.key);
  }

  /**
   * Start the StringeeAudioManager and register for audio device change events.
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeAudio.start((status, code, message) => {
        if (status) {
          this.unregisterEvents();
          let emitterSubscription: EmitterSubscription =
            this.eventEmitter.addListener(stringeeAudioEvents, ({ data }) => {
              if (data !== undefined) {
                this._selectedAudioDevice = AudioDevice.fromJson(
                  data.selectedAudioDevice,
                );
                let audioDevices = data.availableAudioDevices;
                this._availableAudioDevices.length = 0;
                audioDevices.forEach(audioDevice => {
                  this._availableAudioDevices.push(
                    AudioDevice.fromJson(audioDevice),
                  );
                });
                this._listeners.forEach(listener => {
                  listener.onAudioDeviceChange(
                    this._selectedAudioDevice,
                    this._availableAudioDevices,
                  );
                });
              }
            });
          this.subscriptions.push(emitterSubscription);
          this.events.push(stringeeAudioEvents);
          RNStringeeAudio.setNativeEvent(stringeeAudioEvents);
          resolve();
        } else {
          reject(new StringeeError(code, message, 'start'));
        }
      });
    });
  }

  /**
   * Stop the StringeeAudioManager and unregister all events.
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeAudio.stop((status, code, message) => {
        if (status) {
          this.unregisterEvents();
          resolve();
        } else {
          reject(new StringeeError(code, message, 'stop'));
        }
      });
    });
  }

  /**
   * Unregister from listening to events from StringeeAudio.
   * @function unregisterEvents
   */
  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }

    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeAudio.removeNativeEvent(e));
    this.events = [];
  }

  /**
   * Select an audio device to use.
   * @param audioDevice
   */
  selectDevice(audioDevice: AudioDevice): Promise<void> {
    return new Promise((resolve, reject) => {
      let deviceSelectable = false;
      for (const item of this._availableAudioDevices) {
        if (
          item.audioType === audioDevice.audioType &&
          item.name === audioDevice.name &&
          item.uuid === audioDevice.uuid
        ) {
          deviceSelectable = true;
          break;
        }
      }
      if (!deviceSelectable) {
        reject(
          new StringeeError(-3, false, 'Audio device not available to select'),
        );
        return;
      }
      RNStringeeAudio.selectDevice(
        audioDevice.toJson(),
        normalCallbackHandle(resolve, reject, 'selectDevice'),
      );
    });
  }
}

export { StringeeAudioManager };
