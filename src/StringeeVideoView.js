import PropTypes from 'prop-types';
import {
  Dimensions,
  findNodeHandle,
  Platform,
  requireNativeComponent,
  UIManager,
  View,
} from "react-native";
import React, {Component} from 'react';
import {StringeeVideoScalingType, StringeeVideoTrack} from '../index';
import {isIOS} from './helpers/StringeeHelper';

class StringeeVideoView extends Component {
  uuid: string;
  local: boolean;
  scalingType: StringeeVideoScalingType;
  videoTrack: StringeeVideoTrack;

  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.uuid = props.uuid;
    this.local = props.local !== undefined ? props.local : false;
    this.scalingType =
      props.scalingType !== undefined
        ? props.scalingType
        : StringeeVideoScalingType.fill;
    this.videoTrack = props.videoTrack;
  }



  componentDidUpdate(prevProps) {
    if (
      this.props.uuid !== prevProps.uuid ||
      this.props.local !== prevProps.local ||
      this.props.scalingType !== prevProps.scalingType ||
      (this.props.videoTrack &&
        prevProps.videoTrack &&
        (this.props.videoTrack.localId !== prevProps.videoTrack.localId ||
          this.props.videoTrack.serverId !== prevProps.videoTrack.serverId))
    ) {
      this.reload();
    }
  }

  componentDidMount() {
    this.viewId = findNodeHandle(this.ref.current);
    if (Platform.OS === 'android') {
      UIManager.dispatchViewManagerCommand(
        this.viewId,
        UIManager.RNStringeeVideoView.Commands.create.toString(),
        [],
      );
    }
  }

  reload() {
    if (this.props) {
      const reloadCommand = isIOS
        ? UIManager.RNStringeeVideoView.Commands.reload
        : UIManager.RNStringeeVideoView.Commands.reload.toString();
      const params = {
        width: this.props.style.width,
        height: this.props.style.height,
        uuid: this.props.uuid,
        local: this.props.local,
        scalingType: this.props.scalingType,
        videoTrack: this.props.videoTrack,
      };
      UIManager.dispatchViewManagerCommand(this.viewId, reloadCommand, [params]);
    }
  }

  render(): React.ReactNode {
    return (
      <View
        style={this.props.style}
        onLayout={this.reload}
      >
        <RCTStringeeVideoView
          {...this.props}
          uuid={this.uuid}
          local={this.local}
          scalingType={this.scalingType}
          videoTrack={this.videoTrack}
          ref={this.ref}
        />
      </View>
    );
  }
}

StringeeVideoView.propTypes = {
  uuid: PropTypes.string,
  local: PropTypes.bool,
  scalingType: PropTypes.oneOf([
    StringeeVideoScalingType.fit,
    StringeeVideoScalingType.fill,
  ]),
  videoTrack: PropTypes.any,
  ...View.propTypes,
};

const RCTStringeeVideoView = requireNativeComponent('RNStringeeVideoView');

export {StringeeVideoView};
