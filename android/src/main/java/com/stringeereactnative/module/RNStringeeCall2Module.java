package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

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
    public void createWrapper(String uuid, String clientUUID) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            call2Wrapper = new StringeeCall2Wrapper(uuid, getReactApplicationContext());
            call2Wrapper.setClientWrapper(StringeeManager.getInstance().getClientMap().get(clientUUID));
            StringeeManager.getInstance().getCall2Map().put(uuid, call2Wrapper);
        }
    }

    @ReactMethod
    public void makeCall(String uuid, String params, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
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
            callback.invoke(false, -4, "The parameters format is invalid.", "");
        }
    }

    @ReactMethod
    public void initAnswer(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.initAnswer(callback);
    }

    @ReactMethod
    public void answer(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.answer(callback);
    }

    @ReactMethod
    public void reject(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.reject(callback);
    }

    @ReactMethod
    public void hangup(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.hangup(callback);
    }

    @ReactMethod
    public void enableVideo(String uuid, boolean enabled, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.enableVideo(enabled, callback);
    }

    @ReactMethod
    public void mute(String uuid, boolean isMute, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.mute(isMute, callback);
    }

    @ReactMethod
    public void switchCamera(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.switchCamera(callback);
    }

    @ReactMethod
    public void getCallStats(String uuid, final Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.getCallStats(callback);
    }

    @ReactMethod
    public void setSpeakerphoneOn(String uuid, boolean on, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }
        call2Wrapper.setSpeakerphoneOn(on, callback);
    }

    @ReactMethod
    public void resumeVideo(String uuid, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.resumeVideo(callback);
    }

    @ReactMethod
    public void sendCallInfo(String uuid, String info, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
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
    public void sendDTMF(String uuid, String dtmf, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.sendDTMF(dtmf, callback);
    }

    @ReactMethod
    public void setAutoSendTrackMediaStateChangeEvent(String uuid, boolean autoSendTrackMediaStateChangeEvent, Callback callback) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED, "");
            return;
        }

        call2Wrapper.setAutoSendTrackMediaStateChangeEvent(autoSendTrackMediaStateChangeEvent, callback);
    }

    @ReactMethod
    public void clean(String uuid) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            StringeeManager.getInstance().getCall2Map().remove(uuid);
        }
    }

    @ReactMethod
    public void setNativeEvent(String uuid, String event) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            call2Wrapper.setNativeEvent(event);
        }
    }

    @ReactMethod
    public void removeNativeEvent(String uuid, String event) {
        StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);
        if (call2Wrapper != null) {
            call2Wrapper.removeNativeEvent(event);
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
