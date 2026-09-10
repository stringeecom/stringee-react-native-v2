import {getTrackType, TrackType} from '../helpers/StringeeHelper';
import {StringeeRoomUser} from './StringeeRoomUser';

type StringeeVideoTrackPayload = Record<string, any>;

/** Local or remote media track emitted by `StringeeCall2`. */
class StringeeVideoTrack {
  localId: string;
  serverId: string;
  isLocal: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
  trackType: TrackType;
  publisher: StringeeRoomUser;

  constructor(props: StringeeVideoTrackPayload) {
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
