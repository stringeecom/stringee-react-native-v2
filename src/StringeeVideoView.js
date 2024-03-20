import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  findNodeHandle,
  requireNativeComponent,
  UIManager,
  View
} from "react-native";
import { StringeeVideoScalingType } from "../index";
import { isIOS } from "./helpers/StringeeHelper";

const StringeeVideoView = props => {
  const ref = useRef(null);
  const [viewId, setViewId] = useState(null);

  useEffect(() => {
    const id = findNodeHandle(ref.current);
    setViewId(id);
    if (!isIOS) {
      UIManager.dispatchViewManagerCommand(
        id,
        UIManager.RNStringeeVideoView.Commands.create.toString(),
        [id]
      );
    }
  }, []);

  useEffect(() => {
    reload();
  }, [
    props.uuid,
    props.local,
    props.scalingType,
    props.videoTrack,
    props.style
  ]);

  const reload = () => {
    if (viewId != null) {
      const reloadCommand = isIOS
        ? UIManager.RNStringeeVideoView.Commands.reload
        : UIManager.RNStringeeVideoView.Commands.reload.toString();
      const params = {
        width: props.style.width,
        height: props.style.height,
        uuid: props.uuid,
        local: props.local,
        scalingType: props.scalingType,
        videoTrack: props.videoTrack,
      };
      UIManager.dispatchViewManagerCommand(viewId, reloadCommand, [params]);
    }
  };

  return (
    <View style={props.style}>
      <RCTStringeeVideoView
        {...props}
        uuid={props.uuid}
        local={props.local !== undefined ? props.local : false}
        scalingType={
          props.scalingType !== undefined
            ? props.scalingType
            : StringeeVideoScalingType.fill
        }
        videoTrack={props.videoTrack}
        ref={ref}
      />
    </View>
  );
};

StringeeVideoView.propTypes = {
  uuid: PropTypes.string,
  local: PropTypes.bool,
  scalingType: PropTypes.oneOf([
    StringeeVideoScalingType.fit,
    StringeeVideoScalingType.fill
  ]),
  videoTrack: PropTypes.any,
  ...View.propTypes
};

const RCTStringeeVideoView = requireNativeComponent("RNStringeeVideoView");

export { StringeeVideoView };
