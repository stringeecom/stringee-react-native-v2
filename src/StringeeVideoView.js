import PropTypes from 'prop-types';
import {
  findNodeHandle,
  Platform,
  requireNativeComponent,
  UIManager,
  View,
} from 'react-native';
import React, {Component} from 'react';
import {StringeeVideoScalingType, StringeeVideoTrack} from '../index';
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

  componentDidMount() {
    this.viewId = findNodeHandle(this.ref.current);
    if (Platform.OS === 'android') {
      this.createNativeView(this.viewId);
    }
  }

  createNativeView = viewId => {
    UIManager.dispatchViewManagerCommand(
        viewId,
        UIManager.RNStringeeVideoView.Commands.create.toString(),
        [],
    );
  };

  render(): React.ReactNode {
    return (
        <View style={this.props.style}>
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
  videoTrack: PropTypes.instanceOf(StringeeVideoTrack),
  ...View.propTypes,
};

const RCTStringeeVideoView = requireNativeComponent('RNStringeeVideoView');

export {StringeeVideoView};
