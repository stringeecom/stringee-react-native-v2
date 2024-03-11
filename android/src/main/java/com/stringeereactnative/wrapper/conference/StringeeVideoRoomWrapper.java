package com.stringeereactnative.wrapper.conference;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.stringee.call.StringeeCall;
import com.stringee.common.StringeeAudioManager;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.listener.StringeeRoomListener;
import com.stringee.video.RemoteParticipant;
import com.stringee.video.StringeeRoom;
import com.stringee.video.StringeeVideo;
import com.stringee.video.StringeeVideoTrack;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;
import com.stringeereactnative.wrapper.StringeeClientWrapper;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class StringeeVideoRoomWrapper implements StringeeRoomListener, StringeeAudioManager.AudioManagerEvents {
    private final List<String> events = new ArrayList<>();
    private final ReactContext reactContext;
    private StringeeRoom stringeeRoom;
    private final String uuid;
    private StringeeClientWrapper clientWrapper;
    private Callback joinRoomCallback;

    public StringeeVideoRoomWrapper(String uuid, ReactContext reactContext) {
        this.reactContext = reactContext;
        this.uuid = uuid;
    }

    public void setClientWrapper(StringeeClientWrapper clientWrapper) {
        this.clientWrapper = clientWrapper;
    }

    @Override
    public void onConnected(StringeeRoom stringeeRoom) {
        WritableArray trackMaps = Arguments.createArray();
        WritableArray userMaps = Arguments.createArray();
        for (RemoteParticipant remoteParticipant : stringeeRoom.getRemoteParticipants()) {
            userMaps.pushMap(Utils.getRoomUserMap(remoteParticipant));
            for (StringeeVideoTrack videoTrack : remoteParticipant.getVideoTracks()) {
                trackMaps.pushMap(Utils.getVideoTrackInfoMap(videoTrack));
                VideoTrackManager videoTrackManager = new VideoTrackManager(videoTrack, false);
                StringeeManager.getInstance().getTracksMap().put(videoTrack.getId(), videoTrackManager);
            }
        }
        WritableMap roomMap = Utils.getRoomMap(stringeeRoom, uuid);
        if (joinRoomCallback != null) {
            joinRoomCallback.invoke(true, 0, "Success", roomMap, trackMaps, userMaps);
        }
        StringeeManager.getInstance().getRoomMap().put(uuid, this);
        Utils.startAudioManager(reactContext, this);
    }

    @Override
    public void onDisconnected(StringeeRoom stringeeRoom) {

    }

    @Override
    public void onError(StringeeRoom stringeeRoom, StringeeError stringeeError) {
        if (joinRoomCallback != null) {
            joinRoomCallback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
        }
    }

    @Override
    public void onParticipantConnected(StringeeRoom stringeeRoom, RemoteParticipant remoteParticipant) {
        if (Utils.containsEvent(events, Constant.ROOM_ON_JOIN_ROOM)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_USER_INFO, Utils.getRoomUserMap(remoteParticipant));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_JOIN_ROOM, eventData);
        }
    }

    @Override
    public void onParticipantDisconnected(StringeeRoom stringeeRoom, RemoteParticipant remoteParticipant) {
        if (Utils.containsEvent(events, Constant.ROOM_ON_LEAVE_ROOM)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_USER_INFO, Utils.getRoomUserMap(remoteParticipant));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_LEAVE_ROOM, eventData);
        }
    }

    @Override
    public void onVideoTrackAdded(StringeeRoom stringeeRoom, StringeeVideoTrack stringeeVideoTrack) {
        if (Utils.containsEvent(events, Constant.ROOM_ON_ADD_VIDEO_TRACK)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_TRACK_INFO, Utils.getVideoTrackInfoMap(stringeeVideoTrack));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_ADD_VIDEO_TRACK, eventData);
        }
    }

    @Override
    public void onVideoTrackRemoved(StringeeRoom stringeeRoom, StringeeVideoTrack stringeeVideoTrack) {
        if (Utils.containsEvent(events, Constant.ROOM_ON_REMOVE_VIDEO_TRACK)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_TRACK_INFO, Utils.getVideoTrackInfoMap(stringeeVideoTrack));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_REMOVE_VIDEO_TRACK, eventData);
        }
    }

    @Override
    public void onMessage(StringeeRoom stringeeRoom, JSONObject jsonObject, RemoteParticipant remoteParticipant) {
        if (Utils.containsEvent(events, Constant.ROOM_ON_RECEIPT_ROOM_MESSAGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_FROM_USER, Utils.getRoomUserMap(remoteParticipant));
            data.putString(Constant.KEY_MSG, jsonObject.toString());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_RECEIPT_ROOM_MESSAGE, eventData);
        }
    }

    @Override
    public void onVideoTrackNotification(RemoteParticipant remoteParticipant, StringeeVideoTrack stringeeVideoTrack, StringeeVideoTrack.MediaType mediaType) {
    }

    @Override
    public void onAudioDeviceChanged(StringeeAudioManager.AudioDevice audioDevice, Set<StringeeAudioManager.AudioDevice> set) {
        switch (audioDevice) {
            case BLUETOOTH:
                Utils.setBluetoothSco(true);
                Utils.setSpeakerPhone(false);
                break;
            case WIRED_HEADSET:
                Utils.setBluetoothSco(false);
                Utils.setSpeakerPhone(false);
                break;
            default:
                Utils.setBluetoothSco(false);
                Utils.setSpeakerPhone(true);
                break;
        }
    }

    public void sendTrackReadyToPlayEvent(VideoTrackManager trackManager){
        if (Utils.containsEvent(events, Constant.ROOM_ON_TRACK_READY_TO_PLAY)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_TRACK, Utils.getVideoTrackMap(trackManager));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.ROOM_ON_TRACK_READY_TO_PLAY, eventData);
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

    public void joinRoom(final String roomToken, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        if (Utils.isStringEmpty(roomToken)) {
            callback.invoke(false, -2, "roomToken is unidentified or empty");
            return;
        }
        joinRoomCallback = callback;
        stringeeRoom = StringeeVideo.connect(clientWrapper.getStringeeClient(), roomToken, this);
    }

    public void publish(final VideoTrackManager trackManager, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.publish(trackManager.getVideoTrack(), new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success", Utils.getVideoTrackMap(trackManager));
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void unpublish(final VideoTrackManager trackManager, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.unpublish(trackManager.getVideoTrack(), new StatusListener() {
            @Override
            public void onSuccess() {
                trackManager.getVideoTrack().release();
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
            }
        });
    }

    public void subscribe(final VideoTrackManager trackManager, final StringeeVideoTrack.Options options, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.subscribe(trackManager.getVideoTrack(), options, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success", Utils.getVideoTrackMap(trackManager));
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void unsubscribe(final VideoTrackManager trackManager, final Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.unsubscribe(trackManager.getVideoTrack(), new StatusListener() {
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

    public void leave(boolean isLeaveAll, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.leave(isLeaveAll, new StatusListener() {
            @Override
            public void onSuccess() {
                release();
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void sendMessage(JSONObject msg, Callback callback) {
        if (clientWrapper == null || !clientWrapper.isConnected()) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED);
            return;
        }

        stringeeRoom.sendMessage(msg, new StatusListener() {
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

    public void release() {
        Utils.stopAudioManager();
        if (stringeeRoom != null) {
            StringeeVideo.release(stringeeRoom);
        }
    }
}
