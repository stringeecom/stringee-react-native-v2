import {
  StringeeClient,
  StringeeError,
  StringeeRoomUser,
  StringeeVideoRoom,
  StringeeVideoTrack,
  StringeeVideoTrackInfo,
  StringeeVideoTrackOption,
  VideoResolution,
} from '../../index';
import {RNStringeeVideo} from '../helpers/StringeeHelper';

export const joinRoom = (
  client: StringeeClient,
  roomToken: string,
): Promise<any> =>
  new Promise((resolve, reject) => {
    RNStringeeVideo.joinRoom(
      client.uuid,
      roomToken,
      (status, code, message, room, tracks, users) => {
        if (status) {
          resolve({
            room: new StringeeVideoRoom(client, room),
            tracks: tracks.map(item => {
              return new StringeeVideoTrackInfo(item);
            }),
            users: users.map(item => {
              return new StringeeRoomUser(item);
            }),
          });
        } else {
          reject(new StringeeError(code, message, 'joinRoom'));
        }
      },
    );
  });

export const createLocalVideoTrack = (
  room: StringeeVideoRoom,
  option: StringeeVideoTrackOption,
): Promise<StringeeVideoTrack> =>
  new Promise((resolve, reject) => {
    RNStringeeVideo.createLocalVideoTrack(
      room.client.uuid,
      room.uuid,
      option,
      (status, code, message, data) => {
        if (status) {
          let track = new StringeeVideoTrack(data);
          track.roomUUID = room.uuid;
          resolve(track);
        } else {
          reject(new StringeeError(code, message, 'createLocalVideoTrack'));
        }
      },
    );
  });

export const releaseRoom = (videoRoom: StringeeVideoRoom): void => {
  RNStringeeVideo.releaseRoom(videoRoom.uuid);
};
