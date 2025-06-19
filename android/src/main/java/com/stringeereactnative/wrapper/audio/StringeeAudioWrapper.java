package com.stringeereactnative.wrapper.audio;

import android.content.pm.PackageManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.stringee.common.StringeeAudioManager;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.Utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class StringeeAudioWrapper implements StringeeAudioManager.AudioManagerEvents {
    private static volatile StringeeAudioWrapper instance;
    private final List<String> events = new ArrayList<>();
    private final ReactContext reactContext;
    private final List<StringeeAudioManager.AudioDevice> audioDevices = new ArrayList<>();

    private StringeeAudioManager audioManager;

    public StringeeAudioWrapper(ReactContext reactContext) {
        this.reactContext = reactContext;
    }

    public static StringeeAudioWrapper getInstance(ReactContext reactContext) {
        if (instance == null) {
            synchronized (StringeeAudioWrapper.class) {
                if (instance == null) {
                    instance = new StringeeAudioWrapper(reactContext);
                }
            }
        }
        return instance;
    }

    @Override
    public void onAudioDeviceChanged(StringeeAudioManager.AudioDevice audioDevice,
                                     Set<StringeeAudioManager.AudioDevice> availableAudioDevices) {
        audioDevices.clear();
        audioDevices.add(StringeeAudioManager.AudioDevice.SPEAKER_PHONE);
        if (availableAudioDevices.contains(StringeeAudioManager.AudioDevice.BLUETOOTH)) {
            audioDevices.add(StringeeAudioManager.AudioDevice.BLUETOOTH);
        }
        if (availableAudioDevices.contains(StringeeAudioManager.AudioDevice.WIRED_HEADSET)) {
            audioDevices.add(StringeeAudioManager.AudioDevice.WIRED_HEADSET);
        } else {
            if (hasEarpiece()) {
                audioDevices.add(StringeeAudioManager.AudioDevice.EARPIECE);
            }
        }
        if (Utils.containsEvent(events, Constant.AUDIO_ON_AUDIO_DEVICE_CHANGE)) {
            // Selected audio device
            WritableMap selectedAudioDevice = Arguments.createMap();
            selectedAudioDevice.putInt(Constant.KEY_AUDIO_TYPE, audioDevice.ordinal());
            // Available audio devices
            WritableArray availableDevicesMap = Arguments.createArray();
            for (StringeeAudioManager.AudioDevice audioDeviceItem : audioDevices) {
                WritableMap audioDeviceMap = Arguments.createMap();
                audioDeviceMap.putInt(Constant.KEY_AUDIO_TYPE, audioDeviceItem.ordinal());
                availableDevicesMap.pushMap(audioDeviceMap);
            }

            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_SELECTED_AUDIO_DEVICE, selectedAudioDevice);
            data.putArray(Constant.KEY_AVAILABLE_AUDIO_DEVICE, availableDevicesMap);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.AUDIO_ON_AUDIO_DEVICE_CHANGE, eventData);
        }
    }

    private boolean hasEarpiece() {
        return reactContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_TELEPHONY);
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

    public void start(Callback callback) {
        Utils.runOnUiThread(() -> {
            if (audioManager == null) {
                audioManager = StringeeAudioManager.create(reactContext);
                audioManager.start(this);
            }
        });
        callback.invoke(true, 0, "Success");
    }

    public void stop(Callback callback) {
        Utils.runOnUiThread(() -> {
            if (audioManager != null) {
                audioManager.stop();
            }
            audioManager = null;
        });
        callback.invoke(true, 0, "Success");
    }

    public void selectDevice(int audioType, Callback callback) {
        if (audioManager == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_AUDIO_MANAGER_NOT_STARTED, "");
            return;
        }
        StringeeAudioManager.AudioDevice device;
        switch (audioType) {
            case 0:
                device = StringeeAudioManager.AudioDevice.SPEAKER_PHONE;
                break;
            case 1:
                device = StringeeAudioManager.AudioDevice.WIRED_HEADSET;
                break;
            case 2:
                device = StringeeAudioManager.AudioDevice.EARPIECE;
                break;
            case 3:
                device = StringeeAudioManager.AudioDevice.BLUETOOTH;
                break;
            default:
                device = StringeeAudioManager.AudioDevice.NONE;
                break;
        }
        if (device == StringeeAudioManager.AudioDevice.NONE) {
            callback.invoke(false, -2, "Invalid audio type");
            return;
        }
        if (!audioDevices.contains(device)) {
            callback.invoke(false, -3, "Audio device not available");
            return;
        }
        Utils.runOnUiThread(() -> {
            switch (device) {
                case SPEAKER_PHONE:
                    audioManager.setSpeakerphoneOn(true);
                    audioManager.setBluetoothScoOn(false);
                    break;
                case BLUETOOTH:
                    audioManager.setSpeakerphoneOn(false);
                    audioManager.setBluetoothScoOn(true);
                    break;
                default:
                    audioManager.setSpeakerphoneOn(false);
                    audioManager.setBluetoothScoOn(false);
                    break;
            }
            callback.invoke(true, 0, "Success");
        });
    }
}
