package com.stringeereactnative.common;

import com.stringeereactnative.wrapper.StringeeClientWrapper;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;
import com.stringeereactnative.wrapper.conference.StringeeVideoRoomWrapper;

import java.util.HashMap;
import java.util.Map;

public class StringeeManager {
    private static volatile StringeeManager instance;
    private final Map<String, StringeeClientWrapper> clientMap = new HashMap<>();
    private final Map<String, StringeeCallWrapper> callMap = new HashMap<>();
    private final Map<String, StringeeCall2Wrapper> call2Map = new HashMap<>();
    private final Map<String, StringeeVideoRoomWrapper> roomMap = new HashMap<>();
    private final Map<String, VideoTrackManager> tracksMap = new HashMap<>();

    public static StringeeManager getInstance() {
        if (instance == null) {
            synchronized (StringeeManager.class) {
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

    public Map<String, StringeeVideoRoomWrapper> getRoomMap() {
        return roomMap;
    }

    public Map<String, VideoTrackManager> getTracksMap() {
        return tracksMap;
    }
}
