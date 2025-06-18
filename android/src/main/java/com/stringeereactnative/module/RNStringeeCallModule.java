package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

import org.json.JSONException;
import org.json.JSONObject;

public class RNStringeeCallModule extends ReactContextBaseJavaModule {
    public RNStringeeCallModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeCall";
    }

    @ReactMethod
    public void createWrapper(String uuid, String clientUUID) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callWrapper = new StringeeCallWrapper(uuid, getReactApplicationContext());
            callWrapper.setClientWrapper(StringeeManager.getInstance().getClientMap().get(clientUUID));
            StringeeManager.getInstance().getCallMap().put(uuid, callWrapper);
        }
    }

    @ReactMethod
    public void makeCall(String uuid, String params, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }

        try {
            JSONObject jsonObject = new JSONObject(params);
            String from = jsonObject.getString(Constant.KEY_FROM);
            String to = jsonObject.getString(Constant.KEY_TO);
            boolean isVideoCall = jsonObject.getBoolean(Constant.KEY_IS_VIDEO_CALL);
            String customData = jsonObject.optString(Constant.KEY_CUSTOM_DATA);
            String resolution = jsonObject.optString(Constant.KEY_VIDEO_RESOLUTION);
            callWrapper.makeCall(from, to, isVideoCall, customData, resolution, callback);
        } catch (JSONException e) {
            callback.invoke(false, -4, "The parameters format is invalid.", "");
        }
    }

    @ReactMethod
    public void initAnswer(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }

        callWrapper.initAnswer(callback);
    }

    @ReactMethod
    public void answer(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }

        callWrapper.answer(callback);
    }

    @ReactMethod
    public void reject(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }

        callWrapper.reject(callback);
    }

    @ReactMethod
    public void hangup(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.hangup(callback);
    }

    @ReactMethod
    public void enableVideo(String uuid, boolean enabled, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.enableVideo(enabled, callback);
    }

    @ReactMethod
    public void mute(String uuid, boolean isMute, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.mute(isMute, callback);
    }

    @ReactMethod
    public void sendCallInfo(String uuid, String info, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        try {
            JSONObject jsonObject = new JSONObject(info);
            callWrapper.sendCallInfo(jsonObject, callback);
        } catch (JSONException e) {
            callback.invoke(false, -4, "The call info format is invalid.");
        }
    }

    @ReactMethod
    public void sendDTMF(String uuid, String key, final Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.sendDTMF(key, callback);
    }

    @ReactMethod
    public void switchCamera(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.switchCamera(callback);
    }

    @ReactMethod
    public void getCallStats(String uuid, final Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.getCallStats(callback);
    }

    @ReactMethod
    public void resumeVideo(String uuid, Callback callback) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
            return;
        }
        callWrapper.resumeVideo(callback);
    }

    @ReactMethod
    public void clean(String uuid) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper != null) {
            StringeeManager.getInstance().getCallMap().remove(uuid);
        }
    }

    @ReactMethod
    public void setNativeEvent(String uuid, String event) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper != null) {
            callWrapper.setNativeEvent(event);
        }
    }

    @ReactMethod
    public void removeNativeEvent(String uuid, String event) {
        StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
        if (callWrapper != null) {
            callWrapper.removeNativeEvent(uuid);
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
