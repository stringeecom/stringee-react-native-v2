import { ViewStyle } from 'react-native';
import { StringeeVideoScalingType, StringeeVideoTrack } from "../index";

export class StringeeVideoView {
  constructor(props: any);

  uuid: string;
  local: boolean;
  scalingType: StringeeVideoScalingType;
  videoTrack: StringeeVideoTrack;
  ref: any;
  viewId: any;
}

export namespace StringeeVideoView {
  let propTypes: {
    uuid: string;
    local: boolean;
    scalingType: StringeeVideoScalingType;
    videoTrack: any;
    style: ViewStyle;
  };
}
