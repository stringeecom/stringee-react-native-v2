import {AudioType, getAudioType} from './StringeeHelper';

class AudioDevice {
  constructor({audioType = AudioType.none, uuid = null, name = null}) {
    this._audioType = audioType;
    this._uuid = uuid;
    this._name = name;
  }

  get audioType(): AudioType {
    return this._audioType;
  }

  get name(): String {
    return this._name;
  }

  get uuid(): String {
    return this._uuid;
  }

  toJson() {
    return {
      type: this._audioType,
      name: this._name,
      uuid: this._uuid,
    };
  }

  static fromJson(json) {
    const audioType = getAudioType(json.type);
    let name = json.name;

    if (!name) {
      switch (audioType) {
        case AudioType.speakerPhone:
          name = 'Speaker Phone';
          break;
        case AudioType.wiredHeadset:
          name = 'Wired Headset';
          break;
        case AudioType.earpiece:
          name = 'Earpiece';
          break;
        case AudioType.bluetooth:
          name = 'Bluetooth';
          break;
        case AudioType.other:
          name = 'Other';
          break;
        case AudioType.none:
          name = 'None';
          break;
      }
    }

    return new AudioDevice({
      audioType,
      name,
      uuid: json.uuid,
    });
  }
}

export {AudioDevice};
