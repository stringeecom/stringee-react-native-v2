import { ViewStyle } from "react-native";
import { StringeeVideoScalingType, StringeeVideoTrack } from "../index";
import type * as React from "react";

export class StringeeVideoView extends React.Component<StringeeVideoViewProps> {
  constructor(props: any);

  uuid: string;
  local: boolean;
  scalingType: StringeeVideoScalingType;
  videoTrack: StringeeVideoTrack;
  ref: any;
  viewId: any;
}

export interface StringeeVideoViewProps {
  uuid?: string;
  local?: boolean;
  scalingType?: StringeeVideoScalingType;
  videoTrack?: any;
  style?: ViewStyle;
}
