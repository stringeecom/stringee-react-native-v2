package com.stringeereactnative.wrapper.call;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.stringee.call.StringeeCall;
import com.stringee.common.StringeeAudioManager;
import com.stringee.common.StringeeConstant;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.video.TextureViewRenderer;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.wrapper.StringeeClientWrapper;

import org.json.JSONException;
import org.json.JSONObject;
import org.webrtc.RendererCommon;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class StringeeCallWrapper implements StringeeCall.StringeeCallListener, StringeeAudioManager.AudioManagerEvents {
    private final List<String> events = new ArrayList<>();
    private final ReactContext reactContext;
    private StringeeCall stringeeCall;
    private final String uuid;
    private StringeeClientWrapper clientWrapper;
    private Callback makeCallCallback;

    public StringeeCallWrapper(String uuid, ReactContext reactContext) {
        this.reactContext = reactContext;
        this.uuid = uuid;
    }

    public void setStringeeCall(StringeeCall stringeeCall) {
        this.stringeeCall = stringeeCall;
        if (this.stringeeCall != null) {
            this.stringeeCall.setCallListener(this);
        }
    }

    public void setClientWrapper(StringeeClientWrapper clientWrapper) {
        this.clientWrapper = clientWrapper;
    }

    @Override
    public void onSignalingStateChange(StringeeCall stringeeCall, StringeeCall.SignalingState signalingState, String reason, int sipCode, String sipReason) {
        if (signalingState == StringeeCall.SignalingState.CALLING) {
            makeCallCallback.invoke(true, 0, "Success", stringeeCall.getCallId(), stringeeCall.getCustomDataFromYourServer());
        }

        if (Utils.containsEvent(events, Constant.CALL_ON_SIGNALING_STATE_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
            data.putInt(Constant.KEY_CODE, signalingState.getValue());
            data.putString(Constant.KEY_REASON, reason);
            data.putInt(Constant.KEY_SIP_CODE, sipCode);
            data.putString(Constant.KEY_SIP_REASON, sipReason);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_SIGNALING_STATE_CHANGE, eventData);
        }
    }

    @Override
    public void onError(StringeeCall stringeeCall, int code, String desc) {
        makeCallCallback.invoke(false, code, desc, stringeeCall.getCallId(), stringeeCall.getCustomDataFromYourServer());
    }

    @Override
    public void onHandledOnAnotherDevice(StringeeCall stringeeCall, StringeeCall.SignalingState signalingState, String description) {
        if (Utils.containsEvent(events, Constant.CALL_ON_HANDLE_ON_ANOTHER_DEVICE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
            data.putInt(Constant.KEY_CODE, signalingState.getValue());
            data.putString(Constant.KEY_DESCRIPTION, description);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_HANDLE_ON_ANOTHER_DEVICE, eventData);
        }
    }

    @Override
    public void onMediaStateChange(StringeeCall stringeeCall, StringeeCall.MediaState mediaState) {
        if (Utils.containsEvent(events, Constant.CALL_ON_MEDIA_STATE_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
            data.putInt(Constant.KEY_CODE, mediaState.getValue());
            String description = mediaState == StringeeCall.MediaState.CONNECTED ? "Connected" : "Disconnected";
            data.putString(Constant.KEY_DESCRIPTION, description);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_MEDIA_STATE_CHANGE, eventData);
        }
    }

    @Override
    public void onLocalStream(StringeeCall stringeeCall) {
        if (Utils.containsEvent(events, Constant.CALL_ON_LOCAL_STREAM)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_LOCAL_STREAM, eventData);
        }
    }

    @Override
    public void onRemoteStream(StringeeCall stringeeCall) {
        if (Utils.containsEvent(events, Constant.CALL_ON_REMOTE_STREAM)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_REMOTE_STREAM, eventData);
        }
    }

    @Override
    public void onCallInfo(StringeeCall stringeeCall, JSONObject jsonObject) {
        if (Utils.containsEvent(events, Constant.CALL_ON_CALL_INFO)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
            data.putString(Constant.KEY_DATA, jsonObject.toString());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CALL_ON_CALL_INFO, eventData);
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
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
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

    public TextureViewRenderer getLocalView() {
        if (stringeeCall != null) {
            return stringeeCall.getLocalView2();
        }
        return null;
    }

    public void renderLocalView(RendererCommon.ScalingType scalingType) {
        if (stringeeCall != null) {
            stringeeCall.renderLocalView2(scalingType);
        }
    }

    public TextureViewRenderer getRemoteView() {
        if (stringeeCall != null) {
            return stringeeCall.getRemoteView2();
        }
        return null;
    }

    public void renderRemoteView(RendererCommon.ScalingType scalingType) {
        if (stringeeCall != null) {
            stringeeCall.renderRemoteView2(scalingType);
        }
    }

    public void makeCall(String from, String to, boolean isVideoCall, String customData, String resolution, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        makeCallCallback = callback;
        stringeeCall = new StringeeCall(clientWrapper.getStringeeClient(), from, to);
        stringeeCall.setCallListener(this);
        stringeeCall.setVideoCall(isVideoCall);
        if (!Utils.isStringEmpty(customData)) {
            stringeeCall.setCustom(customData);
        }
        if (!Utils.isStringEmpty(resolution)) {
            if (resolution.equalsIgnoreCase("NORMAL")) {
                stringeeCall.setQuality(StringeeConstant.QUALITY_NORMAL);
            } else if (resolution.equalsIgnoreCase("HD")) {
                stringeeCall.setQuality(StringeeConstant.QUALITY_HD);
            }
        }

        Utils.startAudioManager(reactContext, this);

        stringeeCall.makeCall(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });
    }

    public void initAnswer(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.ringing(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        callback.invoke(true, 0, "Success");
    }

    public void answer(Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.answer(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        Utils.startAudioManager(reactContext, this);

        callback.invoke(true, 0, "Success");
    }

    public void reject(Callback callback) {
        Utils.stopAudioManager();

        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.reject(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        callback.invoke(true, 0, "Success");
    }

    public void hangup(Callback callback) {
        Utils.stopAudioManager();

        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.hangup(new StatusListener() {
            @Override
            public void onSuccess() {

            }
        });

        callback.invoke(true, 0, "Success");
    }

    public void enableVideo(boolean enabled, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.enableVideo(enabled);

        callback.invoke(true, 0, "Success");
    }

    public void mute(boolean isMute, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.mute(isMute);

        callback.invoke(true, 0, "Success");
    }

    public void sendCallInfo(JSONObject info, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED, "");
            return;
        }

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall.sendCallInfo(info, new StatusListener() {
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

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall.sendDTMF(key, new StatusListener() {
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

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }
        stringeeCall.switchCamera(new StatusListener() {
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

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.", "");
            return;
        }

        stringeeCall.getStats(new StringeeCall.CallStatsListener() {
            @Override
            public void onCallStats(StringeeCall.StringeeCallStats stringeeCallStats) {
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.put("bytesReceived", stringeeCallStats.callBytesReceived);
                    jsonObject.put("packetsLost", stringeeCallStats.callPacketsLost);
                    jsonObject.put("packetsReceived", stringeeCallStats.callPacketsReceived);
                    jsonObject.put("timeStamp", stringeeCallStats.timeStamp);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                callback.invoke(true, 0, "Success", jsonObject.toString());
            }
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

        if (stringeeCall == null) {
            callback.invoke(false, -3, "The call is not found.");
            return;
        }

        stringeeCall.resumeVideo();
        callback.invoke(true, 0, "Success");
    }
}
