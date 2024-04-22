package com.stringeereactnative.common;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.stringee.common.StringeeAudioManager;
import com.stringee.common.StringeeAudioManager.AudioManagerEvents;
import com.stringee.messaging.ChatProfile;
import com.stringee.messaging.ChatRequest;
import com.stringee.messaging.Conversation;
import com.stringee.messaging.Message;
import com.stringee.messaging.Queue;
import com.stringee.messaging.User;
import com.stringee.video.RemoteParticipant;
import com.stringee.video.StringeeRoom;
import com.stringee.video.StringeeVideoTrack;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.List;
import java.util.UUID;

public class Utils {
    public static Bundle jsonToBundle(String text) throws JSONException {
        JSONObject jsonObject = new JSONObject(text);
        Bundle bundle = new Bundle();
        Iterator<String> iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            String value = jsonObject.getString(key);
            bundle.putString(key, value);
        }
        return bundle;
    }

    public static WritableMap getConversationMap(Conversation conversation) {
        WritableMap conversationMap = Arguments.createMap();
        conversationMap.putString("id", conversation.getId());
        conversationMap.putString("localId", conversation.getLocalId());
        conversationMap.putString("name", conversation.getName());
        conversationMap.putBoolean("isDistinct", conversation.isDistinct());
        conversationMap.putBoolean("isGroup", conversation.isGroup());
        conversationMap.putDouble("updatedAt", conversation.getUpdateAt());
        conversationMap.putString("lastMsgSender", conversation.getLastMsgSender());
        conversationMap.putString("text", conversation.getText());
        conversationMap.putInt("lastMsgType", conversation.getLastMsgType().getValue());
        conversationMap.putInt("unreadCount", conversation.getTotalUnread());
        conversationMap.putString("lastMsgId", conversation.getLastMsgId());
        conversationMap.putString("creator", conversation.getCreator());
        conversationMap.putDouble("created", conversation.getCreateAt());
        conversationMap.putDouble("lastMsgSeq", conversation.getLastMsgSeqReceived());
        conversationMap.putDouble("lastMsgCreatedAt", conversation.getLastTimeNewMsg());
        conversationMap.putInt("lastMsgState", conversation.getLastMsgState().getValue());
        if (conversation.getLastMsg() != null) {
            try {
                Bundle bundle = jsonToBundle(conversation.getLastMsg());
                WritableMap lastMsgMap = Arguments.fromBundle(bundle);
                conversationMap.putMap("text", lastMsgMap);
            } catch (JSONException e) {
                reportException(Utils.class, e);
            }
        }
        List<User> participants = conversation.getParticipants();
        WritableArray participantsMap = Arguments.createArray();
        for (int j = 0; j < participants.size(); j++) {
            WritableMap userMap = getUserMap(participants.get(j));
            participantsMap.pushMap(userMap);
        }
        conversationMap.putArray("participants", participantsMap);
        String pinMsgId = conversation.getPinnedMsgId();
        if (pinMsgId != null) {
            if (!TextUtils.isEmpty(pinMsgId)) {
                conversationMap.putString("pinMsgId", pinMsgId);
            } else {
                conversationMap.putString("pinMsgId", null);
            }
        } else {
            conversationMap.putString("pinMsgId", null);
        }

        return conversationMap;
    }

    public static WritableMap getMessageMap(Message message) {
        WritableMap messageMap = Arguments.createMap();
        messageMap.putString("id", message.getId());
        messageMap.putString("localId", message.getLocalId());
        messageMap.putString("conversationId", message.getConversationId());
        messageMap.putDouble("createdAt", message.getCreatedAt());
        messageMap.putInt("state", message.getState().getValue());
        messageMap.putDouble("sequence", message.getSequence());
        messageMap.putInt("type", message.getType().getValue());
        WritableMap contentMap = Arguments.createMap();
        switch (message.getType()) {
            case TEXT:
            case LINK:
                contentMap.putString("content", message.getText());
                break;
            case PHOTO:
                WritableMap photoMap = Arguments.createMap();
                photoMap.putString("filePath", message.getFileUrl());
                photoMap.putString("thumbnail", message.getThumbnailUrl());
                photoMap.putDouble("ratio", message.getImageRatio());
                contentMap.putMap("photo", photoMap);
                break;
            case VIDEO:
                WritableMap videoMap = Arguments.createMap();
                videoMap.putString("filePath", message.getFileUrl());
                videoMap.putString("thumbnail", message.getThumbnailUrl());
                videoMap.putDouble("ratio", message.getImageRatio());
                videoMap.putInt("duration", message.getDuration());
                contentMap.putMap("video", videoMap);
                break;
            case AUDIO:
                WritableMap audioMap = Arguments.createMap();
                audioMap.putString("filePath", message.getFileUrl());
                audioMap.putInt("duration", message.getDuration());
                contentMap.putMap("audio", audioMap);
                break;
            case FILE:
                WritableMap fileMap = Arguments.createMap();
                fileMap.putString("filePath", message.getFileUrl());
                fileMap.putString("filename", message.getFileName());
                fileMap.putDouble("length", message.getFileLength());
                contentMap.putMap("file", fileMap);
                break;
            case CREATE_CONVERSATION:
            case RENAME_CONVERSATION:
            case RATING:
            case NOTIFICATION:
                try {
                    contentMap = Arguments.fromBundle(jsonToBundle(message.getText()));
                } catch (JSONException e) {
                    reportException(Utils.class, e);
                }
                break;

            case LOCATION:
                WritableMap locationMap = Arguments.createMap();
                locationMap.putDouble("lat", message.getLatitude());
                locationMap.putDouble("lon", message.getLongitude());
                contentMap.putMap("location", locationMap);
                break;
            case CONTACT:
                WritableMap contactMap = Arguments.createMap();
                contactMap.putString("vcard", message.getContact());
                contentMap.putMap("contact", contactMap);
                break;
            case STICKER:
                WritableMap stickerMap = Arguments.createMap();
                stickerMap.putString("name", message.getStickerName());
                stickerMap.putString("category", message.getStickerCategory());
                contentMap.putMap("sticker", stickerMap);
                break;
        }
        messageMap.putMap("content", contentMap);
        messageMap.putString("sender", message.getSenderId());
        return messageMap;
    }

    public static WritableMap getUserMap(User user) {
        WritableMap userMap = Arguments.createMap();
        userMap.putString("userId", user.getUserId());
        userMap.putString("name", user.getName());
        userMap.putString("avatar", user.getAvatarUrl());
        userMap.putString("role", user.getRole().getValue());
        userMap.putString("email", user.getEmail());
        userMap.putString("phone", user.getPhone());
        userMap.putString("location", user.getLocation());
        userMap.putString("browser", user.getBrowser());
        userMap.putString("platform", user.getPlatform());
        userMap.putString("device", user.getDevice());
        userMap.putString("ipAddress", user.getIpAddress());
        userMap.putString("hostName", user.getHostName());
        userMap.putString("userAgent", user.getUserAgent());
        return userMap;
    }

    public static WritableMap getChatRequestMap(ChatRequest chatRequest) {
        WritableMap chatRequestMap = Arguments.createMap();
        chatRequestMap.putString("convId", chatRequest.getConvId());
        chatRequestMap.putInt("channelType", chatRequest.getChannelType().getValue());
        chatRequestMap.putInt("type", chatRequest.getRequestType().getValue());
        chatRequestMap.putString("customerId", chatRequest.getCustomerId());
        chatRequestMap.putString("customerName", chatRequest.getName());
        return chatRequestMap;
    }

    public static WritableMap getChatProfileMap(ChatProfile chatProfile) {
        WritableMap conversationMap = Arguments.createMap();
        conversationMap.putString("id", chatProfile.getId());
        conversationMap.putString("background", chatProfile.getBackground());
        conversationMap.putString("hour", chatProfile.getBusinessHour());
        conversationMap.putString("language", chatProfile.getLanguage());
        conversationMap.putString("logoUrl", chatProfile.getLogoUrl());
        conversationMap.putString("popupAnswerUrl", chatProfile.getPopupAnswerUrl());
        conversationMap.putString("portal", chatProfile.getPortalId());
        conversationMap.putBoolean("autoCreateTicket", chatProfile.isAutoCreateTicket());
        conversationMap.putBoolean("enabled", chatProfile.isEnabledBusinessHour());
        conversationMap.putBoolean("facebookAsLivechat", chatProfile.isFacebookAsLivechat());
        conversationMap.putInt("projectId", chatProfile.getProjectId());
        conversationMap.putBoolean("zaloAsLivechat", chatProfile.isZaloAsLivechat());

        List<Queue> queues = chatProfile.getQueues();
        WritableArray queuesMap = Arguments.createArray();
        if (!isListEmpty(queues)) {
            for (int j = 0; j < queues.size(); j++) {
                WritableMap queueMap = getQueueMap(queues.get(j));
                queuesMap.pushMap(queueMap);
            }
        }
        conversationMap.putArray("queues", queuesMap);
        return conversationMap;
    }

    public static WritableMap getQueueMap(Queue queue) {
        WritableMap queueMap = Arguments.createMap();
        queueMap.putString("id", queue.getId());
        queueMap.putString("name", queue.getName());
        return queueMap;
    }

    public static WritableMap getVideoTrackMap(VideoTrackManager trackManager) {
        WritableMap videoTrackMap = Arguments.createMap();
        videoTrackMap.putString("localId", trackManager.getLocalId());
        videoTrackMap.putString("serverId", trackManager.getServerId());
        videoTrackMap.putBoolean("isLocal", trackManager.isLocal());
        videoTrackMap.putBoolean("audio", trackManager.audioEnabled());
        videoTrackMap.putBoolean("video", trackManager.videoEnabled());
        videoTrackMap.putBoolean("screen", trackManager.isScreenCapture());
        videoTrackMap.putInt("trackType", trackManager.getTrackType().getValue());
        WritableMap roomUserMap = Arguments.createMap();
        roomUserMap.putString("userId", trackManager.getPublisher());
        videoTrackMap.putMap("publisher", roomUserMap);
        return videoTrackMap;
    }

    public static WritableMap getVideoTrackInfoMap(StringeeVideoTrack stringeeVideoTrack) {
        WritableMap videoTrackMap = Arguments.createMap();
        videoTrackMap.putString("id", stringeeVideoTrack.getId());
        videoTrackMap.putBoolean("audio", stringeeVideoTrack.audioEnabled());
        videoTrackMap.putBoolean("video", stringeeVideoTrack.videoEnabled());
        videoTrackMap.putBoolean("screen", stringeeVideoTrack.isScreenCapture());
        WritableMap roomUserMap = Arguments.createMap();
        roomUserMap.putString("userId", stringeeVideoTrack.getUserId());
        videoTrackMap.putMap("publisher", roomUserMap);
        return videoTrackMap;
    }

    public static WritableMap getRoomMap(StringeeRoom stringeeRoom, String uuid) {
        WritableMap queueMap = Arguments.createMap();
        queueMap.putString("id", stringeeRoom.getId());
        queueMap.putBoolean("recorded", stringeeRoom.isRecorded());
        queueMap.putString("uuid", uuid);
        return queueMap;
    }

    public static WritableMap getRoomUserMap(RemoteParticipant remoteParticipant) {
        WritableMap queueMap = Arguments.createMap();
        queueMap.putString("userId", remoteParticipant.getId());
        return queueMap;
    }

    public static boolean isStringEmpty(@Nullable CharSequence text) {
        if (text != null) {
            if (text.toString().equalsIgnoreCase("null")) {
                return true;
            } else {
                return text.toString().trim().isEmpty();
            }
        } else {
            return true;
        }
    }

    public static boolean isListEmpty(@Nullable ReadableArray list) {
        if (list != null) {
            return list.size() == 0;
        } else {
            return true;
        }
    }

    public static boolean isListEmpty(@Nullable List<?> list) {
        if (list != null) {
            return list.isEmpty();
        } else {
            return true;
        }
    }

    public static boolean isMapEmpty(@Nullable ReadableMap readableMap) {
        if (readableMap != null) {
            return readableMap.toHashMap().isEmpty();
        } else {
            return true;
        }
    }

    public static void runOnUiThread(Runnable runnable) {
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(runnable);
    }

    public static void startAudioManager(Context context, AudioManagerEvents events) {
        runOnUiThread(() -> {
            StringeeAudioManager audioManager = StringeeAudioManager.create(context);
            audioManager.start(events);
            AudioManager.getInstance().setAudioManager(audioManager);
        });
    }

    public static void stopAudioManager() {
        runOnUiThread(() -> {
            StringeeAudioManager audioManager = AudioManager.getInstance().getAudioManager();
            if (audioManager != null) {
                audioManager.stop();
                AudioManager.getInstance().setAudioManager(null);
            }
        });
    }

    public static void setSpeakerPhone(boolean on) {
        runOnUiThread(() -> {
            StringeeAudioManager audioManager = AudioManager.getInstance().getAudioManager();
            if (audioManager != null) {
                audioManager.setSpeakerphoneOn(on);
            }
        });
    }

    public static void setBluetoothSco(boolean on) {
        runOnUiThread(() -> {
            StringeeAudioManager audioManager = AudioManager.getInstance().getAudioManager();
            if (audioManager != null) {
                audioManager.setBluetoothScoOn(on);
            }
        });
    }

    public static int dpiToPx(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }

    public static boolean containsEvent(List<String> array, String value) {
        if (!Utils.isListEmpty(array)) {
            for (int i = 0; i < array.size(); i++) {
                if (array.get(i).equals(value)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap eventData) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }

    public static <T> void reportException(@NonNull Class<T> clazz, Exception exception) {
        Log.e("Stringee exception", clazz.getName(), exception);
    }

    public static String createLocalId() {
        return "android-" + UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
    }
}
