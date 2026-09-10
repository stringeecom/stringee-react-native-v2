import React, {Component} from 'react';
import {
  findNodeHandle,
  Platform,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  StringeeVideoScalingType,
  isIOS,
} from './helpers/StringeeHelper';
import type {StringeeVideoTrack} from './video/StringeeVideoTrack';

export interface StringeeVideoViewProps {
  /** Owning call UUID when rendering a `StringeeCall` stream. */
  uuid?: string;
  /** Render the local stream instead of the remote stream. Defaults to `false`. */
  local?: boolean;
  /** Fit the complete frame or crop it to fill the view. */
  scalingType?: StringeeVideoScalingType;
  /** Track emitted by `StringeeCall2`; use instead of `uuid` for track rendering. */
  videoTrack?: StringeeVideoTrack | null;
  /** React Native view style. Explicit width and height are recommended. */
  style?: StyleProp<ViewStyle>;
}

type ViewManagerConfig = {
  Commands?: Record<string, number | string>;
};

type LegacyUIManager = typeof UIManager & {
  RNStringeeVideoView?: ViewManagerConfig;
};

const getViewManagerConfig = (): ViewManagerConfig | undefined =>
  UIManager.getViewManagerConfig?.('RNStringeeVideoView') ??
  (UIManager as LegacyUIManager).RNStringeeVideoView;

const RCTStringeeVideoView =
  requireNativeComponent<StringeeVideoViewProps>('RNStringeeVideoView');

/** Native-backed React component for local and remote Stringee video. */
class StringeeVideoView extends Component<StringeeVideoViewProps> {
  private nativeRef: React.Component<StringeeVideoViewProps> | null = null;
  private viewId: number | null = null;

  override componentDidUpdate(prevProps: StringeeVideoViewProps): void {
    const previousStyle = StyleSheet.flatten(prevProps.style) ?? {};
    const currentStyle = StyleSheet.flatten(this.props.style) ?? {};
    const previousTrack = prevProps.videoTrack;
    const currentTrack = this.props.videoTrack;

    if (
      this.props.uuid !== prevProps.uuid ||
      this.props.local !== prevProps.local ||
      this.props.scalingType !== prevProps.scalingType ||
      currentTrack?.localId !== previousTrack?.localId ||
      currentTrack?.serverId !== previousTrack?.serverId ||
      currentStyle.width !== previousStyle.width ||
      currentStyle.height !== previousStyle.height
    ) {
      this.reload();
    }
  }

  override componentDidMount(): void {
    this.viewId = findNodeHandle(this.nativeRef as never);
    const createCommand = getViewManagerConfig()?.Commands?.create;

    if (
      Platform.OS === 'android' &&
      this.viewId !== null &&
      createCommand !== undefined
    ) {
      UIManager.dispatchViewManagerCommand(
        this.viewId,
        String(createCommand),
        [],
      );
    }
  }

  reload(): void {
    const reloadCommand = getViewManagerConfig()?.Commands?.reload;
    if (this.viewId === null || reloadCommand === undefined) {
      return;
    }

    const style = StyleSheet.flatten(this.props.style) ?? {};
    const params = {
      height: style.height,
      local: this.props.local ?? false,
      scalingType:
        this.props.scalingType ?? StringeeVideoScalingType.fill,
      uuid: this.props.uuid,
      videoTrack: this.props.videoTrack,
      width: style.width,
    };

    UIManager.dispatchViewManagerCommand(
      this.viewId,
      isIOS ? reloadCommand : String(reloadCommand),
      [params],
    );
  }

  override render(): React.ReactNode {
    return (
      <View style={this.props.style}>
        <RCTStringeeVideoView
          {...this.props}
          local={this.props.local ?? false}
          ref={ref => {
            this.nativeRef = ref as never;
          }}
          scalingType={
            this.props.scalingType ?? StringeeVideoScalingType.fill
          }
        />
      </View>
    );
  }
}

export {StringeeVideoView};
