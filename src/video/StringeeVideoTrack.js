import {
  NativeModules,
} from 'react-native';

import {TrackType, StringeeRoomUser, StringeeError} from '../../index';
import {getTrackType, normalCallbackHandle} from '../helpers/StringeeHelper';

const RNStringeeVideoTrack = NativeModules.RNStringeeVideoTrack;

class StringeeVideoTrack {
  localId: string;
  serverId: string;
  isLocal: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
  trackType: TrackType;
  publisher: StringeeRoomUser;
  roomId: string;

  constructor(props) {
    this.localId = props.localId;
    this.serverId = props.serverId;
    this.isLocal = props.isLocal;
    this.audio = props.audio;
    this.video = props.video;
    this.screen = props.screen;
    this.trackType = getTrackType(props.trackType);
    this.publisher = new StringeeRoomUser(props.publisher);
    this.roomId = props.roomId ? props.roomId : "";
  }

  mute = (isMute: boolean): Promise<void> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.mute(this isMute, normalCallbackHandle(resolve, reject, 'mute'));
  })

  enableVideo = (isEnable: boolean): Promise<void> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.enableVideo(this, isEnable, normalCallbackHandle(resolve, reject, 'enableVideo'));
  })

  switchCamera = (): Promise<void> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.switchCamera(this, normalCallbackHandle(resolve, reject, 'switchCamera'))
  })

  release = (): Promise<void>  => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.release(this, normalCallbackHandle(resolve, reject, 'release'));
  })

  snapShot = (): Promise<string> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.snapShot(this, (status, code, message, data) => {
      if (status) {
        resolve(data);
      } else { 
        reject(new StringeeError(code, message, 'snapShot'));
      }
    })
  })

  sendAudioEnableNotification = (isOn: boolean): Promise<void> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.sendAudioEnableNotification(this, isOn, normalCallbackHandle(resolve, reject, 'sendAudioEnableNotification'));
  })

  sendVideoEnableNotification = (isOn: boolean): Promise<void> => new Promise((resolve, reject) => {
    RNStringeeVideoTrack.sendVideoEnableNotification(this, isOn, normalCallbackHandle(resolve, reject, 'sendVideoEnableNotification'));
  })
}

export {StringeeVideoTrack};
