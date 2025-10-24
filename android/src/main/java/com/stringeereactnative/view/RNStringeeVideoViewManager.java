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
    public final int COMMAND_RELOAD = 2;
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
        return MapBuilder.of("create", COMMAND_CREATE, "reload", COMMAND_RELOAD);
    }

    @Override
    public void receiveCommand(@NonNull RNStringeeVideoView root, int commandId,
                               ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        handleReceiveCommand(root, String.valueOf(commandId), args);
    }

    @Override
    public void receiveCommand(@NonNull RNStringeeVideoView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);
        handleReceiveCommand(root, commandId, args);
    }

    private void handleReceiveCommand(@NonNull RNStringeeVideoView root, String commandId, @Nullable ReadableArray args){
        int commandIdInt = Integer.parseInt(commandId);
        if (args != null) {
            switch (commandIdInt) {
                case COMMAND_CREATE:
                    root.createView();
                    break;
                case COMMAND_RELOAD:
                    if (args.size() > 0) {
                        ReadableMap newProps = args.getMap(0);
                        int width = newProps.getInt("width");
                        int height = newProps.getInt("height");
                        String uuid = newProps.getString("uuid");
                        boolean isLocal = newProps.getBoolean("local");
                        String scalingType = newProps.getString("scalingType");
                        ReadableMap videoTrackMap = newProps.getMap("videoTrack");
                        root.setWidth(width);
                        root.setHeight(height);
                        root.setUUID(uuid);
                        root.setLocal(isLocal);
                        root.setScalingType(scalingType);
                        root.setVideoTrackMap(videoTrackMap);
                        root.createView();
                    }
                    break;
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
