package com.stringeereactnative.wrapper.call;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.stringee.call.StringeeCall2;
import com.stringee.common.StringeeAudioManager;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.video.StringeeVideoTrack;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;
import com.stringeereactnative.wrapper.StringeeClientWrapper;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class StringeeCall2Wrapper implements StringeeAudioManager.AudioManagerEvents, StringeeCall2.StringeeCallListener {
    private final List<String> events = new ArrayList<>();
    private final ReactContext reactContext;
    private StringeeCall2 stringeeCall2;
    private final String uuid;
    private StringeeClientWrapper clientWrapper;
    private Callback makeCallCallback;

    public StringeeCall2Wrapper(String uuid, ReactContext reactContext) {
        this.reactContext = reactContext;
        this.uuid = uuid;
    }

    public void setStringeeCall2(StringeeCall2 stringeeCall2) {
        this.stringeeCall2 = stringeeCall2;
        if (this.stringeeCall2 != null) {
            this.stringeeCall2.setCallListener(this);
        }
    }

    public void setClientWrapper(StringeeClientWrapper clientWrapper) {
        this.clientWrapper = clientWrapper;
    }

    @Override
    public void onSignalingStateChange(StringeeCall2 stringeeCall2, StringeeCall2.SignalingState signalingState, String reason, int sipCode, String sipReason) {
        if (signalingState == StringeeCall2.SignalingState.CALLING) {
            makeCallCallback.invoke(true, 0, "Success", stringeeCall2.getCallId(), stringeeCall2.getCustomDataFromYourServer());
        }

        if (Utils.containsEvent(events, Constant.CALL2_ON_SIGNALING_STATE_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putInt(Constant.KEY_CODE, signalingState.getValue());
            data.putString(Constant.KEY_REASON, reason);
            data.putInt(Constant.KEY_SIP_CODE, sipCode);
            data.putString(Constant.KEY_SIP_REASON, sipReason);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_SIGNALING_STATE_CHANGE, eventData);
        }
    }

    @Override
    public void onError(StringeeCall2 stringeeCall2, int code, String desc) {
        makeCallCallback.invoke(false, code, desc, stringeeCall2.getCallId(), stringeeCall2.getCustomDataFromYourServer());
    }

    @Override
    public void onHandledOnAnotherDevice(StringeeCall2 stringeeCall2, StringeeCall2.SignalingState signalingState, String description) {
        if (Utils.containsEvent(events, Constant.CALL2_ON_HANDLE_ON_ANOTHER_DEVICE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putInt(Constant.KEY_CODE, signalingState.getValue());
            data.putString(Constant.KEY_DESCRIPTION, description);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_HANDLE_ON_ANOTHER_DEVICE, eventData);
        }
    }

    @Override
    public void onMediaStateChange(StringeeCall2 stringeeCall2, StringeeCall2.MediaState mediaState) {
        if (Utils.containsEvent(events, Constant.CALL2_ON_MEDIA_STATE_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putInt(Constant.KEY_CODE, mediaState.getValue());
            String description = mediaState == StringeeCall2.MediaState.CONNECTED ? "Connected" : "Disconnected";
            data.putString(Constant.KEY_DESCRIPTION, description);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_MEDIA_STATE_CHANGE, eventData);
        }
    }

    @Override
    public void onLocalStream(StringeeCall2 stringeeCall2) {

    }

    @Override
    public void onLocalTrackAdded(StringeeCall2 stringeeCall2, StringeeVideoTrack stringeeVideoTrack) {
        VideoTrackManager videoTrackManager = VideoTrackManager.createForCall(stringeeVideoTrack);
        StringeeManager.getInstance().getTracksMap().put(stringeeVideoTrack.getId(), videoTrackManager);
        if (Utils.containsEvent(events, Constant.CALL2_ON_LOCAL_TRACK_ADDED)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putMap(Constant.KEY_VIDEO_TRACK, Utils.getVideoTrackMap(videoTrackManager));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_LOCAL_TRACK_ADDED, eventData);
        }
    }

    @Override
    public void onRemoteStream(StringeeCall2 stringeeCall2) {

    }

    @Override
    public void onRemoteTrackAdded(StringeeCall2 stringeeCall2, StringeeVideoTrack stringeeVideoTrack) {
        VideoTrackManager videoTrackManager = VideoTrackManager.createForCall(stringeeVideoTrack);
        StringeeManager.getInstance().getTracksMap().put(stringeeVideoTrack.getId(), videoTrackManager);
        if (Utils.containsEvent(events, Constant.CALL2_ON_REMOTE_TRACK_ADDED)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putMap(Constant.KEY_VIDEO_TRACK, Utils.getVideoTrackMap(videoTrackManager));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_REMOTE_TRACK_ADDED, eventData);
        }
    }

    @Override
    public void onVideoTrackAdded(StringeeVideoTrack stringeeVideoTrack) {

    }

    @Override
    public void onVideoTrackRemoved(StringeeVideoTrack stringeeVideoTrack) {

    }

    @Override
    public void onCallInfo(StringeeCall2 stringeeCall2, JSONObject jsonObject) {
        if (Utils.containsEvent(events, Constant.CALL2_ON_CALL_INFO)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putString(Constant.KEY_DATA, jsonObject.toString());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_CALL_INFO, eventData);
        }
    }

    @Override
    public void onTrackMediaStateChange(String from, StringeeVideoTrack.MediaType mediaType, boolean enable) {
        if (Utils.containsEvent(events, Constant.CALL2_ON_TRACK_MEDIA_STATE_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putString(Constant.KEY_FROM, from);
            data.putInt(Constant.KEY_MEDIA_TYPE, mediaType.getValue());
            data.putBoolean(Constant.KEY_ENABLE, enable);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL2_ON_TRACK_MEDIA_STATE_CHANGE, eventData);
        }
    }

    @Override
    public void onAudioDeviceChanged(StringeeAudioManager.AudioDevice audioDevice, Set<StringeeAudioManager.AudioDevice> set) {
        if (Utils.containsEvent(events, Constant.AUDIO_ON_AUDIO_DEVICE_CHANGE)) {
            List<StringeeAudioManager.AudioDevice> listAvailableDevices = new ArrayList<>(set);
            WritableArray availableDevicesMap = Arguments.createArray();
            for (int j = 0; j < listAvailableDevices.size(); j++) {
                StringeeAudioManager.AudioDevice device = listAvailableDevices.get(j);
                availableDevicesMap.pushString(device.name());
            }

            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putString(Constant.KEY_SELECTED_AUDIO_DEVICE, audioDevice.name());
            data.putArray(Constant.KEY_AVAILABLE_AUDIO_DEVICE, availableDevicesMap);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.AUDIO_ON_AUDIO_DEVICE_CHANGE, eventData);
        }
    }

    public void setNativeEvent(String event) {
        if (!Utils.isStringEmpty(event)) {
            events.add(event);
        }
    }

    public void removeNativeEvent(String event) {
        if (!Utils.isStringEmpty(event)) {
            events.remove(event);
        }
    }

    public void makeCall(String from, String to, boolean isVideoCall, String customData, String resolution, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        makeCallCallback = callback;
        stringeeCall2 = new StringeeCall2(clientWrapper.getStringeeClient(), from, to);
        stringeeCall2.setVideoCall(isVideoCall);
        if (!Utils.isStringEmpty(customData)) {
            stringeeCall2.setCustom(customData);
        }
        if (!Utils.isStringEmpty(resolution)) {
            if (resolution.equalsIgnoreCase("NORMAL")) {
                stringeeCall2.setQuality(StringeeCall2.VideoQuality.QUALITY_480P);
            } else if (resolution.equalsIgnoreCase("HD")) {
                stringeeCall2.setQuality(StringeeCall2.VideoQuality.QUALITY_720P);
            }
        }

        stringeeCall2.setCallListener(this);
        stringeeCall2.makeCall(new StatusListener() {
            @Override
            public void onSuccess() {
                Utils.startAudioManager(reactContext, StringeeCall2Wrapper.this);
            }
        });
    }

    public void initAnswer(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.ringing(new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void answer(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.answer(new StatusListener() {
            @Override
            public void onSuccess() {
                Utils.startAudioManager(reactContext, StringeeCall2Wrapper.this);
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void reject(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.reject(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        Utils.stopAudioManager();

        callback.invoke(true, 0, "Success");
    }

    public void hangup(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.hangup(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        Utils.stopAudioManager();

        callback.invoke(true, 0, "Success");
    }

    public void enableVideo(boolean enabled, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.enableVideo(enabled);

        callback.invoke(true, 0, "Success");
    }

    public void mute(boolean isMute, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.mute(isMute);

        callback.invoke(true, 0, "Success");
    }

    public void sendCallInfo(JSONObject info, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall2.sendCallInfo(info, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void sendDTMF(String key, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall2.sendDTMF(key, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError error) {
                super.onError(error);
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void switchCamera(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall2.switchCamera(new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void getCallStats(final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.", "");
            return;
        }

        stringeeCall2.getStats(stringeeCallStats -> {
            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("bytesReceived", stringeeCallStats.callBytesReceived);
                jsonObject.put("packetsLost", stringeeCallStats.callPacketsLost);
                jsonObject.put("packetsReceived", stringeeCallStats.callPacketsReceived);
                jsonObject.put("timeStamp", stringeeCallStats.timeStamp);
            } catch (JSONException e) {
                Utils.reportException(StringeeCall2Wrapper.class, e);
            }
            callback.invoke(true, 0, "Success", jsonObject.toString());
        });
    }

    public void setSpeakerphoneOn(boolean on, Callback callback) {
        Utils.setSpeakerPhone(on);
        callback.invoke(true, 0, "Success");
    }

    public void resumeVideo(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall2.resumeVideo();
        callback.invoke(true, 0, "Success");
    }

    public void setAutoSendTrackMediaStateChangeEvent(boolean autoSendTrackMediaStateChangeEvent, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall2 == null) {
            callback.invoke(false, -3, "The call is not found.", "");
            return;
        }

        stringeeCall2.setAutoSendTrackMediaStateChangeEvent(autoSendTrackMediaStateChangeEvent);
        callback.invoke(true, 0, "Success");
    }
}
