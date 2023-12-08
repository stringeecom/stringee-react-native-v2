import { StringeeVideoRoom, StringeeVideoTrackInfo } from '../conference'
import { StringeeRoomUser } from '../video/StringeeRoomUser'
import { StringeeVideoTrack } from '../video/StringeeVideoTrack';

export default class StringeeVideoRoomListener {
    onJoinRoom: (room: StringeeVideoRoom, user: StringeeRoomUser) => void;
    onLeaveRoom: (room: StringeeVideoRoom, user: StringeeRoomUser) => void;
    onAddVideoTrack: (room: StringeeVideoRoom, trackInfo: StringeeVideoTrackInfo) => void;
    onRemoveVideoTrack: (room: StringeeVideoRoom, trackInfo: StringeeVideoTrackInfo) => {}
    onReceiptRoomMessage: (room: StringeeVideoRoom, from: StringeeRoomUser, message: any) => void;
    onTrackReadyToPlay :(room: StringeeVideoRoom, track: StringeeVideoTrack) => void;
    onTrackMediaStateChange:(room: StringeeVideoRoom, mediaType: String, enable: boolean, from: string, trackInfo: StringeeVideoTrackInfo) => void;
}