import PropTypes from 'prop-types';
import {
  findNodeHandle,
  Platform,
  requireNativeComponent,
  UIManager,
  View,
} from 'react-native';
import React, {Component} from 'react';
import {StringeeVideoScalingType} from 'index';
class StringeeVideoView extends Component {
  uuid: string;
  local: boolean;
  scalingType: StringeeVideoScalingType;

  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.uuid = props.uuid;
    this.local = props.local !== undefined ? props.local : false;
    this.scalingType =
        props.scalingType !== undefined
            ? props.scalingType
            : StringeeVideoScalingType.fill;
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
  ...View.propTypes,
};

const RCTStringeeVideoView = requireNativeComponent('RNStringeeVideoView');

export {StringeeVideoView};
