package com.stringeereactnative.common;

import com.stringeereactnative.wrapper.StringeeClientWrapper;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

import java.util.HashMap;
import java.util.Map;

public class StringeeManager {
    private static volatile StringeeManager instance;
    private static final Object lock = new Object();
    private final Map<String, StringeeClientWrapper> clientMap = new HashMap<>();
    private final Map<String, StringeeCallWrapper> callMap = new HashMap<>();
    private final Map<String, StringeeCall2Wrapper> call2Map = new HashMap<>();

    public static StringeeManager getInstance() {
        if (instance == null) {
            synchronized (lock) {
                if (instance == null) {
                    instance = new StringeeManager();
                }
            }
        }
        return instance;
    }

    public Map<String, StringeeClientWrapper> getClientMap() {
        return clientMap;
    }

    public Map<String, StringeeCallWrapper> getCallMap() {
        return callMap;
    }

    public Map<String, StringeeCall2Wrapper> getCall2Map() {
        return call2Map;
    }
}
