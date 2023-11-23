import {TrackType, StringeeRoomUser} from '../../index';
import {getTrackType} from '../helpers/StringeeHelper';

class StringeeVideoTrack {
  localId: string;
  serverId: string;
  isLocal: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
  trackType: TrackType;
  publisher: StringeeRoomUser;

  constructor(props) {
    this.localId = props.localId;
    this.serverId = props.serverId;
    this.isLocal = props.isLocal;
    this.audio = props.audio;
    this.video = props.video;
    this.screen = props.screen;
    this.trackType = getTrackType(props.trackType);
    this.publisher = new StringeeRoomUser(props.publisher);
  }
}

export {StringeeVideoTrack};
