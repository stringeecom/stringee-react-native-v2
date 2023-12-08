import { StringeeRoomUser } from "../video/StringeeRoomUser";


export default class StringeeVideoTrackInfo {
    id: string;
    audio: boolean;
    video: boolean;
    screen: boolean;
    player: boolean;
    publisher: StringeeRoomUser

    constructor(probs) {
        this.id = probs.id;
        this.audio = probs.audio;
        this.video = probs.video;
        this.screen = probs.screen;
        this.player = probs.player;
        this.publisher = new StringeeRoomUser(probs.publisher);
    }
}