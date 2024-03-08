package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;

import org.webrtc.Camera1Enumerator;
import org.webrtc.Camera2Enumerator;
import org.webrtc.CameraEnumerator;

public class RNStringeeVideoTrackModule extends ReactContextBaseJavaModule {
    public RNStringeeVideoTrackModule(ReactApplicationContext reactContext) {
        super(reactContext);
        getCameraName();
    }

    private boolean canSwitch = true;
    private boolean isFrontCamera = true;
    String frontCameraName = "";
    String rearCameraName = "";

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeVideoTrack";
    }

    private void getCameraName() {
        // get cameraId
        CameraEnumerator enumerator = Camera2Enumerator.isSupported(getReactApplicationContext()) ? new Camera2Enumerator(getReactApplicationContext()) : new Camera1Enumerator();
        String[] cameraNames = enumerator.getDeviceNames();
        if (cameraNames.length > 0) {
            // first front id is main front camera
            for (String name : cameraNames) {
                boolean isFrontFace = enumerator.isFrontFacing(name);
                if (isFrontFace) {
                    frontCameraName = name;
                    break;
                }
            }

            // first rear id is main rear camera
            for (String cameraName : cameraNames) {
                boolean isBackFace = enumerator.isBackFacing(cameraName);
                if (isBackFace) {
                    rearCameraName = cameraName;
                    break;
                }
            }
        }

        canSwitch = (!Utils.isStringEmpty(frontCameraName) && !Utils.isStringEmpty(rearCameraName));
    }

    @ReactMethod
    public void mute(final ReadableMap trackMap, final boolean isMute, final Callback callback) {
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

        videoTrackManager.getVideoTrack().mute(isMute);
        callback.invoke(true, 0, "Success");
    }

    @ReactMethod
    public void enableVideo(final ReadableMap trackMap, final boolean isEnable, final Callback callback) {
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

        videoTrackManager.getVideoTrack().enableVideo(isEnable);
        callback.invoke(true, 0, "Success");
    }

    @ReactMethod
    public void switchCamera(final ReadableMap trackMap, final Callback callback) {
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

        if (canSwitch) {
            videoTrackManager.getVideoTrack().switchCamera(new StatusListener() {
                @Override
                public void onSuccess() {
                    callback.invoke(true, 0, "Success");
                }

                @Override
                public void onError(StringeeError stringeeError) {
                    super.onError(stringeeError);
                    callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
                }
            }, isFrontCamera ? rearCameraName : frontCameraName);
        } else {
            if (Utils.isStringEmpty(frontCameraName) && Utils.isStringEmpty(rearCameraName)) {
                callback.invoke(false, -1, "The device does not have any cameras");
            } else if (Utils.isStringEmpty(rearCameraName)) {
                callback.invoke(false, -1, "The device does not have a rear camera");
            } else if (Utils.isStringEmpty(frontCameraName)) {
                callback.invoke(false, -1, "The device does not have a front camera");
            }
        }
    }

    @ReactMethod
    public void release(final ReadableMap trackMap, final Callback callback) {
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

        videoTrackManager.getVideoTrack().release();
        callback.invoke(true, 0, "Success");
    }
}
