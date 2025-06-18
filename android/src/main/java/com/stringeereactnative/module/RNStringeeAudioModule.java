package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.wrapper.audio.StringeeAudioWrapper;

public class RNStringeeAudioModule extends ReactContextBaseJavaModule {
    public RNStringeeAudioModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeAudio";
    }

    @ReactMethod
    public void start(Callback callback) {
        StringeeAudioWrapper.getInstance(getReactApplicationContext()).start(callback);
    }

    @ReactMethod
    public void stop(Callback callback) {
        StringeeAudioWrapper.getInstance(getReactApplicationContext()).stop(callback);
    }

    @ReactMethod
    public void selectDevice(ReadableMap map, Callback callback) {
        String audioType = map.getString(Constant.KEY_AUDIO_TYPE);
        StringeeAudioWrapper.getInstance(getReactApplicationContext())
                .selectDevice(audioType, callback);
    }

    @ReactMethod
    public void setNativeEvent(String event) {
        StringeeAudioWrapper.getInstance(getReactApplicationContext()).setNativeEvent(event);
    }

    @ReactMethod
    public void removeNativeEvent(String event) {
        StringeeAudioWrapper.getInstance(getReactApplicationContext()).removeNativeEvent(event);
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
