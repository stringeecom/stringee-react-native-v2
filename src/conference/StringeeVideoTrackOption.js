
export default class StringeeVideoTrackOption {
    audio: boolean;
    video: boolean;
    screen: boolean;
    videoResolution: string;

    constructor(audio: boolean, video: boolean, screen: boolean, videoResolution: string) {
        this.audio = audio;
        this.video = video;
        this.screen = screen;
        this.videoResolution = videoResolution;
    }
}