package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.video.StringeeVideo;
import com.stringee.video.StringeeVideoTrack;
import com.stringee.video.VideoDimensions;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;
import com.stringeereactnative.wrapper.StringeeClientWrapper;
import com.stringeereactnative.wrapper.conference.StringeeVideoRoomWrapper;

import java.util.UUID;

public class RNStringeeVideoModule extends ReactContextBaseJavaModule {
    public RNStringeeVideoModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeVideo";
    }

    @ReactMethod
    public void joinRoom(final String uuid, final String roomToken, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        String roomUUID = UUID.randomUUID().toString();
        StringeeVideoRoomWrapper roomWrapper = new StringeeVideoRoomWrapper(roomUUID, getReactApplicationContext());
        roomWrapper.setClientWrapper(clientWrapper);
        roomWrapper.joinRoom(roomToken, callback);
    }

    @ReactMethod
    public void createLocalVideoTrack(final String uuid, final String roomUUID, final ReadableMap optionsMap, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(roomUUID);
        if (roomWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_ROOM_NOT_INITIALIZED);
            return;
        }

        if (optionsMap == null) {
            callback.invoke(false, -2, "option is unidentified or empty");
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

        StringeeVideoTrack stringeeVideoTrack = StringeeVideo.createLocalVideoTrack(getReactApplicationContext(), options, new StatusListener() {
            @Override
            public void onSuccess() {

            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });

        if (stringeeVideoTrack != null) {
            String localId = Utils.createLocalId();
            VideoTrackManager videoTrackManager = VideoTrackManager.create(stringeeVideoTrack, localId, clientWrapper.getStringeeClient().getUserId());
            callback.invoke(true, 0, "Success", Utils.getVideoTrackMap(videoTrackManager));
            videoTrackManager.setRoomWrapper(roomWrapper);
            StringeeManager.getInstance().getTracksMap().put(localId, videoTrackManager);
        }
    }

    @ReactMethod
    public void releaseRoom(final String roomUUID) {
        Utils.stopAudioManager();
        StringeeVideoRoomWrapper roomWrapper = StringeeManager.getInstance().getRoomMap().get(roomUUID);
        if (roomWrapper == null) {
            return;
        }
        roomWrapper.release();
    }
}
