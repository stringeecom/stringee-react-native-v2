import {VideoResolution} from '../helpers/StringeeHelper';

class StringeeVideoTrackOption {
  audio: boolean;
  video: boolean;
  screen: boolean;
  videoResolution: VideoResolution;

  constructor(
    audio: boolean,
    video: boolean,
    screen: boolean,
    videoResolution: VideoResolution,
  ) {
    this.audio = audio;
    this.video = video;
    this.screen = screen;
    this.videoResolution = videoResolution;
  }
}

export {StringeeVideoTrackOption};
