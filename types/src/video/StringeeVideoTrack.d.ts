export class StringeeVideoTrack {
    constructor(props?: any);
    localId: string;
    serverId: string;
    isLocal: boolean;
    audio: boolean;
    video: boolean;
    screen: boolean;
    trackType: TrackType;
    publisher: StringeeRoomUser;
}
import { StringeeRoomUser, TrackType } from "../../index";
