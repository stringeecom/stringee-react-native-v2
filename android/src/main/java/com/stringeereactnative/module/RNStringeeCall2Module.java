package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;

import org.json.JSONException;
import org.json.JSONObject;

public class RNStringeeCall2Module extends ReactContextBaseJavaModule {
    public RNStringeeCall2Module(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeCall2";
    }

    @ReactMethod
    public void createWrapper(final String uuid, final String clientUUID) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            call2Wrapper = new StringeeCall2Wrapper(uuid, getReactApplicationContext());
            call2Wrapper.setClientWrapper(StringeeManager.getInstance().getClientMap().get(clientUUID));
            StringeeManager.getInstance().getCall2Map().put(uuid, call2Wrapper);
        }
    }

    @ReactMethod
    public void makeCall(final String uuid, final String params, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        try {
            JSONObject jsonObject = new JSONObject(params);
            String from = jsonObject.getString(Constant.KEY_FROM);
            String to = jsonObject.getString(Constant.KEY_TO);
            boolean isVideoCall = jsonObject.getBoolean(Constant.KEY_IS_VIDEO_CALL);
            String customData = jsonObject.optString(Constant.KEY_CUSTOM_DATA);
            String resolution = jsonObject.optString(Constant.KEY_VIDEO_RESOLUTION);
            call2Wrapper.makeCall(from, to, isVideoCall, customData, resolution, callback);
        } catch (JSONException e) {
            callback.invoke(false, -4, "The parameters format is invalid.");
        }
    }

    @ReactMethod
    public void initAnswer(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.initAnswer(callback);
    }

    @ReactMethod
    public void answer(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.answer(callback);
    }

    @ReactMethod
    public void reject(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.reject(callback);
    }

    @ReactMethod
    public void hangup(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.hangup(callback);
    }

    @ReactMethod
    public void enableVideo(final String uuid, final boolean enabled, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.enableVideo(enabled, callback);
    }

    @ReactMethod
    public void mute(final String uuid, final boolean isMute, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.mute(isMute, callback);
    }

    @ReactMethod
    public void switchCamera(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.switchCamera(callback);
    }

    @ReactMethod
    public void getCallStats(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.getCallStats(callback);
    }

    @ReactMethod
    public void setSpeakerphoneOn(final String uuid, final boolean on, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }
        call2Wrapper.setSpeakerphoneOn(on, callback);
    }

    @ReactMethod
    public void resumeVideo(final String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.resumeVideo(callback);
    }

    @ReactMethod
    public void sendCallInfo(final String uuid, final String info, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        try {
            JSONObject jsonObject = new JSONObject(info);
            call2Wrapper.sendCallInfo(jsonObject, callback);
        } catch (JSONException e) {
            callback.invoke(false, -4, "The call info format is invalid.");
        }
    }

    @ReactMethod
    public void sendDTMF(final String uuid, final String dtmf, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.sendDTMF(dtmf, callback);
    }

    @ReactMethod
    public void setAutoSendTrackMediaStateChangeEvent(final String uuid, final boolean autoSendTrackMediaStateChangeEvent, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED);
            return;
        }

        call2Wrapper.setAutoSendTrackMediaStateChangeEvent(autoSendTrackMediaStateChangeEvent, callback);
    }

    @ReactMethod
    public void clean(final String uuid) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            StringeeManager.getInstance().getCall2Map().remove(uuid);
        }
    }

    @ReactMethod
    public void setNativeEvent(final String uuid, final String event) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            call2Wrapper.setNativeEvent(event);
        }
    }

    @ReactMethod
    public void removeNativeEvent(final String uuid, final String event) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            call2Wrapper.removeNativeEvent(event);
        }
    }

    @ReactMethod
    public void addListener(final String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(final Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
