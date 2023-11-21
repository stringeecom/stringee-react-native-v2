package com.stringeereactnative.common;

import com.stringee.common.StringeeAudioManager;

public class AudioManager {
    private static volatile AudioManager instance;
    private static final Object lock = new Object();
    private StringeeAudioManager audioManager;

    public static AudioManager getInstance() {
        if (instance == null) {
            synchronized (lock) {
                if (instance == null) {
                    instance = new AudioManager();
                }
            }
        }
        return instance;
    }

    public StringeeAudioManager getAudioManager() {
        return audioManager;
    }

    public void setAudioManager(StringeeAudioManager audioManager) {
        this.audioManager = audioManager;
    }
}
