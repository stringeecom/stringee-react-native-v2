package com.stringeereactnative.view;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class RNStringeeVideoViewManager extends ViewGroupManager<RNStringeeVideoView> {
    public final int COMMAND_CREATE = 1;
    ReactApplicationContext reactContext;

    public RNStringeeVideoViewManager(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeVideoView";
    }

    @NonNull
    @Override
    protected RNStringeeVideoView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RNStringeeVideoView(reactContext);
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("create", COMMAND_CREATE);
    }

    @Override
    public void receiveCommand(@NonNull RNStringeeVideoView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        int commandIdInt = Integer.parseInt(commandId);

        if (commandIdInt == COMMAND_CREATE) {
            if (args != null) {
                root.createView();
            }
        }
    }

    @ReactProp(name = ViewProps.WIDTH)
    public void setWidth(RNStringeeVideoView view, int width) {
        view.setWidth(width);
    }

    @ReactProp(name = ViewProps.HEIGHT)
    public void setHeight(RNStringeeVideoView view, int height) {
        view.setHeight(height);
    }

    @ReactProp(name = "uuid")
    public void setUUID(RNStringeeVideoView view, String uuid) {
        view.setUUID(uuid);
    }

    @ReactProp(name = "local")
    public void setLocal(RNStringeeVideoView view, boolean isLocal) {
        view.setLocal(isLocal);
    }

    @ReactProp(name = "scalingType")
    public void setScalingType(RNStringeeVideoView view, String scalingType) {
        view.setScalingType(scalingType);
    }

    @ReactProp(name = "videoTrack")
    public void setVideoTrackMap(RNStringeeVideoView view, ReadableMap videoTrackMap) {
        view.setVideoTrackMap(videoTrackMap);
    }
}
