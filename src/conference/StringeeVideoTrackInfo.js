import {StringeeRoomUser} from '../../index';

class StringeeVideoTrackInfo {
  id: string;
  audio: boolean;
  video: boolean;
  screen: boolean;
  publisher: StringeeRoomUser;

  constructor(props) {
    this.id = props.id;
    this.audio = props.audio;
    this.video = props.video;
    this.screen = props.screen;
    this.publisher = new StringeeRoomUser(props.publisher);
  }
}

export {StringeeVideoTrackInfo};
