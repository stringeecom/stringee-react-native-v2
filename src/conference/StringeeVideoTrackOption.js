import {VideoResolution} from '../helpers/StringeeHelper';

class StringeeVideoTrackOption {
  audio: boolean = true;
  video: boolean = true;
  screen: boolean;
  videoResolution: VideoResolution;

  constructor({
                audio = true,
                video = true,
                screen = false,
                videoResolution = VideoResolution.normal,
              }: {
    audio: boolean,
    video: boolean,
    screen: boolean,
    videoResolution: VideoResolution,
  }) {
    this.audio = audio;
    this.video = video;
    this.screen = screen;
    this.videoResolution = videoResolution;
  }
}

export {StringeeVideoTrackOption};
