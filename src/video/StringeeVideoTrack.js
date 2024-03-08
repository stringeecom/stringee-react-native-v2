import {StringeeRoomUser, TrackType} from '../../index';
import {
  getTrackType,
  normalCallbackHandle,
  RNStringeeVideoTrack,
} from '../helpers/StringeeHelper';

class StringeeVideoTrack {
  localId: string;
  serverId: string;
  isLocal: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
  trackType: TrackType;
  publisher: StringeeRoomUser;
  roomUUID: string;

  constructor(props) {
    this.localId = props.localId;
    this.serverId = props.serverId;
    this.isLocal = props.isLocal;
    this.audio = props.audio;
    this.video = props.video;
    this.screen = props.screen;
    this.trackType = getTrackType(props.trackType);
    this.publisher = new StringeeRoomUser(props.publisher);
    this.roomUUID = '';
  }

  mute = (isMute: boolean): Promise<void> =>
    new Promise((resolve, reject) => {
      RNStringeeVideoTrack.mute(
        this,
        isMute,
        normalCallbackHandle(resolve, reject, 'mute'),
      );
    });

  enableVideo = (isEnable: boolean): Promise<void> =>
    new Promise((resolve, reject) => {
      RNStringeeVideoTrack.enableVideo(
        this,
        isEnable,
        normalCallbackHandle(resolve, reject, 'enableVideo'),
      );
    });

  switchCamera = (): Promise<void> =>
    new Promise((resolve, reject) => {
      RNStringeeVideoTrack.switchCamera(
        this,
        normalCallbackHandle(resolve, reject, 'switchCamera'),
      );
    });

  release = (): Promise<void> =>
    new Promise((resolve, reject) => {
      RNStringeeVideoTrack.release(
        this,
        normalCallbackHandle(resolve, reject, 'release'),
      );
    });
}

export {StringeeVideoTrack};
