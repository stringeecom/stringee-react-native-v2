import {
  MediaType,
  StringeeRoomUser,
  StringeeVideoRoom,
  StringeeVideoTrack,
  StringeeVideoTrackInfo,
} from '../../index';

class StringeeVideoRoomListener {
  onJoinRoom: (room: StringeeVideoRoom, user: StringeeRoomUser) => void;
  onLeaveRoom: (room: StringeeVideoRoom, user: StringeeRoomUser) => void;
  onAddVideoTrack: (
    room: StringeeVideoRoom,
    trackInfo: StringeeVideoTrackInfo,
  ) => void;
  onRemoveVideoTrack: (
    room: StringeeVideoRoom,
    trackInfo: StringeeVideoTrackInfo,
  ) => {};
  onReceiptRoomMessage: (
    room: StringeeVideoRoom,
    from: StringeeRoomUser,
    message: Object,
  ) => void;
  onTrackReadyToPlay: (
    room: StringeeVideoRoom,
    track: StringeeVideoTrack,
  ) => void;
}

export {StringeeVideoRoomListener};
