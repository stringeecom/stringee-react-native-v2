package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.stringee.video.StringeeVideoTrack;
import com.stringee.video.VideoDimensions;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;
import com.stringeereactnative.wrapper.conference.StringeeVideoRoomWrapper;

import org.json.JSONException;
import org.json.JSONObject;

public class RNStringeeVideoRoomModule extends ReactContextBaseJavaModule {
    public RNStringeeVideoRoomModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeVideoRoom";
    }

    @ReactMethod
    public void publish(final String uuid, final ReadableMap trackMap, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        String localId = trackMap.getString("localId");
        if (Utils.isStringEmpty(localId)) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        VideoTrackManager videoTrackManager = StringeeManager.getInstance().getTracksMap().get(localId);
        if (videoTrackManager == null) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        roomWrapper.publish(videoTrackManager, callback);
    }

    @ReactMethod
    public void unpublish(final String uuid, final ReadableMap trackMap, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        String localId = trackMap.getString("localId");
        if (Utils.isStringEmpty(localId)) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        VideoTrackManager videoTrackManager = StringeeManager.getInstance().getTracksMap().get(localId);
        if (videoTrackManager == null) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        roomWrapper.unpublish(videoTrackManager, callback);
        StringeeManager.getInstance().getTracksMap().remove(localId);
    }

    @ReactMethod
    public void subscribe(final String uuid, final ReadableMap trackInfoMap, final ReadableMap optionsMap, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        String trackId = trackInfoMap.getString("id");
        if (Utils.isStringEmpty(trackId)) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        VideoTrackManager videoTrackManager = StringeeManager.getInstance().getTracksMap().get(trackId);
        if (videoTrackManager == null) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        StringeeVideoTrack.Options options = new StringeeVideoTrack.Options();
        boolean video = false;
        if (optionsMap.hasKey("video")) {
            video = optionsMap.getBoolean("video");
        }
        options.video(video);
        boolean audio = false;
        if (optionsMap.hasKey("audio")) {
            audio = optionsMap.getBoolean("audio");
        }
        options.audio(audio);
        boolean screen = false;
        if (optionsMap.hasKey("screen")) {
            screen = optionsMap.getBoolean("screen");
        }
        options.screen(screen);
        if (optionsMap.hasKey("videoResolution")) {
            VideoDimensions videoDimensions = VideoDimensions.VGA_VIDEO_DIMENSIONS;
            String videoResolution = optionsMap.getString("videoResolution");
            if (!Utils.isStringEmpty(videoResolution)) {
                switch (videoResolution) {
                    case "HD":
                        videoDimensions = VideoDimensions.HD_720P_VIDEO_DIMENSIONS;
                        break;
                    case "FULL_HD":
                        videoDimensions = VideoDimensions.HD_1080P_VIDEO_DIMENSIONS;
                        break;
                }
            }
            options.videoDimensions(videoDimensions);
        }

        roomWrapper.subscribe(videoTrackManager, options, callback);
    }

    @ReactMethod
    public void unsubscribe(final String uuid, final ReadableMap trackInfoMap, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        String trackId = trackInfoMap.getString("id");
        if (Utils.isStringEmpty(trackId)) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        VideoTrackManager videoTrackManager = StringeeManager.getInstance().getTracksMap().get(trackId);
        if (videoTrackManager == null) {
            callback.invoke(false, -2, "Video track is not found");
            return;
        }

        roomWrapper.unsubscribe(videoTrackManager, callback);
    }

    @ReactMethod
    public void leave(final String uuid, boolean isLeaveAll, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        roomWrapper.leave(isLeaveAll, callback);
    }

    @ReactMethod
    public void sendMessage(final String uuid, String msg, final Callback callback) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }
        try {
            JSONObject msgObject = new JSONObject(msg);
            roomWrapper.sendMessage(msgObject, callback);
        } catch (JSONException e) {
            callback.invoke(false, -4, "The msg format is invalid.");
        }
    }

    @ReactMethod
    public void setNativeEvent(String uuid, String event) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper != null) {
            roomWrapper.setNativeEvent(event);
        }
    }

    @ReactMethod
    public void removeNativeEvent(String uuid, String event) {
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(uuid);
        if (roomWrapper != null) {
            roomWrapper.removeNativeEvent(event);
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
