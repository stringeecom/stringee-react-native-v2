package com.stringeereactnative.module;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.stringee.common.SocketAddress;
import com.stringee.messaging.ConversationOptions;
import com.stringee.messaging.Message;
import com.stringee.messaging.Message.Type;
import com.stringee.messaging.User;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.wrapper.StringeeClientWrapper;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class RNStringeeClientModule extends ReactContextBaseJavaModule {

    public RNStringeeClientModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNStringeeClient";
    }

    @ReactMethod
    public void createClientWrapper(String uuid, String baseUrl, ReadableArray addressArray, String stringeeXBaseUrl) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            clientWrapper = new StringeeClientWrapper(uuid, getReactApplicationContext());
            List<SocketAddress> socketAddresses = new ArrayList<>();
            if (!Utils.isListEmpty(addressArray)) {
                for (int i = 0; i < addressArray.size(); i++) {
                    ReadableMap addressMap = addressArray.getMap(i);
                    SocketAddress socketAddress = new SocketAddress(addressMap.getString("host"), addressMap.getInt("port"));
                    socketAddresses.add(socketAddress);
                }
            }
            clientWrapper.initializeStringeeClient(socketAddresses, baseUrl, stringeeXBaseUrl);
            StringeeManager.getInstance().getClientMap().put(uuid, clientWrapper);
        }
    }

    @ReactMethod
    public void connect(final String uuid, final String accessToken) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper != null) {
            clientWrapper.connect(accessToken);
        }
    }

    @ReactMethod
    public void disconnect(final String uuid) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper != null) {
            clientWrapper.disconnect();
        }
    }

    @ReactMethod
    public void registerPushToken(final String uuid, final String token, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(token)) {
            callback.invoke(false, -2, "token is unidentified or empty");
            return;
        }

        clientWrapper.registerPushToken(token, callback);
    }

    @ReactMethod
    public void registerPushAndDeleteOthers(final String uuid, final String token, final ReadableArray packagesArray, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(token)) {
            callback.invoke(false, -2, "token is unidentified or empty");
            return;
        }

        List<String> packages = null;
        if (packagesArray != null) {
            if (packagesArray.size() > 0) {
                packages = new ArrayList<>();
                for (int i = 0; i < packagesArray.size(); i++) {
                    packages.add(packagesArray.getString(i));
                }
            }
        }

        clientWrapper.registerPushAndDeleteOthers(token, packages, callback);
    }

    @ReactMethod
    public void unregisterPushToken(final String uuid, final String token, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(token)) {
            callback.invoke(false, -2, "token is unidentified or empty");
            return;
        }

        clientWrapper.unregisterPushToken(token, callback);
    }

    @ReactMethod
    public void sendCustomMessage(final String uuid, final String toUser, final String msg, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(toUser)) {
            callback.invoke(false, -2, "toUserId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(msg)) {
            callback.invoke(false, -2, "message is unidentified or empty");
            return;
        }

        try {
            JSONObject jsonObject = new JSONObject(msg);
            clientWrapper.sendCustomMessage(toUser, jsonObject, callback);
        } catch (JSONException e) {
            Utils.reportException(RNStringeeClientModule.class, e);
            callback.invoke(false, -2, "message is not in JSON format");
        }
    }

    @ReactMethod
    public void createConversation(final String uuid, final ReadableArray usersArray, final ReadableMap optionsMap, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isListEmpty(usersArray)) {
            callback.invoke(false, -2, "userIds is unidentified or empty");
            return;
        }

        List<User> participants = new ArrayList<>();
        for (int i = 0; i < usersArray.size(); i++) {
            User user = new User(usersArray.getString(i));
            participants.add(user);
        }

        ConversationOptions convOptions = null;
        if (optionsMap != null) {
            convOptions = new ConversationOptions();
            if (optionsMap.hasKey("name")) {
                convOptions.setName(optionsMap.getString("name"));
            }
            if (optionsMap.hasKey("isGroup")) {
                convOptions.setGroup(optionsMap.getBoolean("isGroup"));
            }
            if (optionsMap.hasKey("isDistinct")) {
                convOptions.setDistinct(optionsMap.getBoolean("isDistinct"));
            }
        }

        clientWrapper.createConversation(participants, convOptions, callback);
    }

    @ReactMethod
    public void getConversationById(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getConversationById(convId, callback);
    }

    @ReactMethod
    public void getLocalConversations(final String uuid, final String userId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(userId)) {
            callback.invoke(false, -2, "userId is unidentified or empty");
            return;
        }

        clientWrapper.getLocalConversations(userId, callback);
    }

    @ReactMethod
    public void getLastConversations(final String uuid, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getLastConversations(count, callback);
    }

    @ReactMethod
    public void getConversationsBefore(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getConversationsBefore((long) datetime, count, callback);
    }

    @ReactMethod
    public void getConversationsAfter(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getConversationsAfter((long) datetime, count, callback);
    }

    @ReactMethod
    public void deleteConversation(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.deleteConversation(convId, callback);
    }

    @ReactMethod
    public void addParticipants(final String uuid, final String convId, final ReadableArray usersArray, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isListEmpty(usersArray)) {
            callback.invoke(false, -2, "userIds is unidentified or empty");
            return;
        }

        List<User> users = new ArrayList<>();
        for (int i = 0; i < usersArray.size(); i++) {
            User user = new User(usersArray.getString(i));
            users.add(user);
        }
        clientWrapper.addParticipants(convId, users, callback);
    }

    @ReactMethod
    public void removeParticipants(final String uuid, final String convId, final ReadableArray usersArray, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isListEmpty(usersArray)) {
            callback.invoke(false, -2, "userIds is unidentified or empty");
            return;
        }

        List<User> users = new ArrayList<>();
        for (int i = 0; i < usersArray.size(); i++) {
            User user = new User(usersArray.getString(i));
            users.add(user);
        }

        clientWrapper.removeParticipants(convId, users, callback);
    }

    @ReactMethod
    public void sendMessage(final String uuid, final ReadableMap messageMap, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (messageMap == null) {
            callback.invoke(false, -2, "message is unidentified or empty");
            return;
        }

        String convId = messageMap.getString("convId");

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        final Type type = Type.getType(messageMap.getInt("type"));
        final ReadableMap msgMap = messageMap.getMap("message");

        if (msgMap == null) {
            callback.invoke(false, -2, "message is unidentified or empty");
            return;
        }

        Message message = new Message(type);
        switch (type) {
            case TEXT:
            case LINK:
                message = new Message(msgMap.getString("content"));
                break;
            case PHOTO:
                ReadableMap photoMap = msgMap.getMap("photo");
                if (photoMap == null) {
                    callback.invoke(false, -2, "message photo is unidentified or empty");
                    return;
                }
                message.setFileUrl(photoMap.getString("filePath"));
                message.setThumbnailUrl(photoMap.getString("thumbnail"));
                message.setImageRatio((float) photoMap.getDouble("ratio"));
                break;
            case VIDEO:
                ReadableMap videoMap = msgMap.getMap("video");
                if (videoMap == null) {
                    callback.invoke(false, -2, "message video is unidentified or empty");
                    return;
                }
                message.setFileUrl(videoMap.getString("filePath"));
                message.setThumbnailUrl(videoMap.getString("thumbnail"));
                message.setImageRatio((float) videoMap.getDouble("ratio"));
                message.setDuration(videoMap.getInt("duration"));
                break;
            case AUDIO:
                ReadableMap audioMap = msgMap.getMap("audio");
                if (audioMap == null) {
                    callback.invoke(false, -2, "message audio is unidentified or empty");
                    return;
                }
                message.setFileUrl(audioMap.getString("filePath"));
                message.setDuration(audioMap.getInt("duration"));
                break;
            case FILE:
                ReadableMap fileMap = msgMap.getMap("file");
                if (fileMap == null) {
                    callback.invoke(false, -2, "message file is unidentified or empty");
                    return;
                }
                message.setFileUrl(fileMap.getString("filePath"));
                message.setFileName(fileMap.getString("filename"));
                message.setFileLength(fileMap.getInt("length"));
                break;
            case LOCATION:
                ReadableMap locationMap = msgMap.getMap("location");
                if (locationMap == null) {
                    callback.invoke(false, -2, "message location is unidentified or empty");
                    return;
                }
                message.setLatitude(locationMap.getDouble("lat"));
                message.setLongitude(locationMap.getDouble("lon"));
                break;
            case CONTACT:
                ReadableMap contactMap = msgMap.getMap("contact");
                if (contactMap == null) {
                    callback.invoke(false, -2, "message contact is unidentified or empty");
                    return;
                }
                message.setContact(contactMap.getString("vcard"));
                break;
            case STICKER:
                ReadableMap stickerMap = msgMap.getMap("sticker");
                if (stickerMap == null) {
                    callback.invoke(false, -2, "message sticker is unidentified or empty");
                    return;
                }
                message.setStickerCategory(stickerMap.getString("category"));
                message.setStickerName(stickerMap.getString("name"));
                break;
            default:
                break;
        }
        clientWrapper.sendMessage(convId, message, callback);
    }

    @ReactMethod
    public void getLocalMessages(final String uuid, final String convId, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (convId == null) {
            callback.invoke(false, -2, "Conversation id can not be null");
            return;
        }

        clientWrapper.getLocalMessages(convId, count, callback);
    }

    @ReactMethod
    public void getLastMessages(final String uuid, final String convId, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getLastMessages(convId, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }


    @ReactMethod
    public void getMessagesAfter(final String uuid, final String convId, final int sequence, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getMessagesAfter(convId, sequence, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }

    @ReactMethod
    public void getMessagesBefore(final String uuid, final String convId, final int sequence, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getMessagesBefore(convId, sequence, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }

    @ReactMethod
    public void deleteMessage(final String uuid, final String convId, final String msgId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "messageId is unidentified or empty");
            return;
        }

        JSONArray messageIds = new JSONArray();
        messageIds.put(msgId);
        clientWrapper.deleteMessage(convId, messageIds, callback);
    }

    @ReactMethod
    public void markConversationAsRead(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.markConversationAsRead(convId, callback);
    }

    @ReactMethod
    public void clearDb(final String uuid, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }
        clientWrapper.clearDb(callback);
    }

    @ReactMethod
    public void updateConversation(final String uuid, final String convId, final ReadableMap convMap, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (convMap == null) {
            callback.invoke(false, -2, "conversation info is unidentified or empty");
            return;
        }

        String name = "";
        if (convMap.hasKey("name")) {
            name = convMap.getString("name");
        }
        String avatar = "";
        if (convMap.hasKey("avatar")) {
            avatar = convMap.getString("avatar");
        }

        clientWrapper.updateConversation(convId, name, avatar, callback);
    }

    @ReactMethod
    public void getConversationWithUser(final String uuid, final String userId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(userId)) {
            callback.invoke(false, -2, "userId is unidentified or empty");
            return;
        }

        clientWrapper.getConversationWithUser(userId, callback);
    }

    @ReactMethod
    public void getUnreadConversationCount(final String uuid, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getUnreadConversationCount(callback);
    }

    @ReactMethod
    public void getLastUnreadConversations(final String uuid, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getLastUnreadConversations(count, callback);
    }

    @ReactMethod
    public void getUnreadConversationsBefore(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getUnreadConversationsBefore((long) datetime, count, callback);
    }

    @ReactMethod
    public void getUnreadConversationsAfter(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getUnreadConversationsAfter((long) datetime, count, callback);
    }

    @ReactMethod
    public void getAllLastConversations(final String uuid, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getAllLastConversations(count, callback);
    }

    @ReactMethod
    public void getAllConversationsBefore(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getAllConversationsBefore((long) datetime, count, callback);
    }

    @ReactMethod
    public void getAllConversationsAfter(final String uuid, final double datetime, final int count, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.getAllConversationsAfter((long) datetime, count, callback);
    }

    @ReactMethod
    public void getAllLastMessages(final String uuid, final String convId, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getAllLastMessages(convId, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }


    @ReactMethod
    public void getAllMessagesAfter(final String uuid, final String convId, final int sequence, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getAllMessagesAfter(convId, sequence, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }

    @ReactMethod
    public void getAllMessagesBefore(final String uuid, final String convId, final int sequence, final int count, final boolean loadDeletedMsg, final boolean loadDeletedMsgContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.getAllMessagesBefore(convId, sequence, count, loadDeletedMsg, loadDeletedMsgContent, callback);
    }

    @ReactMethod
    public void getChatProfile(final String uuid, final String widgetKey, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(widgetKey)) {
            callback.invoke(false, -2, "widgetKey is unidentified or empty");
            return;
        }

        clientWrapper.getChatProfile(widgetKey, callback);
    }

    @ReactMethod
    public void getLiveChatToken(final String uuid, final String widgetKey, final String name, final String email, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(widgetKey)) {
            callback.invoke(false, -2, "widgetKey is unidentified or empty");
            return;
        }

        clientWrapper.getLiveChatToken(widgetKey, name, email, callback);
    }

    @ReactMethod
    public void updateUserInfo(final String uuid, final String name, final String email, final String avatar, final String phone, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        clientWrapper.updateUserInfo(name, email, avatar, phone, callback);
    }

    @ReactMethod
    public void updateUserInfo2(final String uuid, final String userInfo, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(userInfo)) {
            callback.invoke(false, -2, "userInfo is unidentified or empty");
            return;
        }

        try {
            JSONObject userObject = new JSONObject(userInfo);
            User user = new User();
            user.setName(userObject.optString("name", ""));
            user.setAvatarUrl(userObject.optString("avatar", ""));
            user.setEmail(userObject.optString("email", ""));
            user.setPhone(userObject.optString("phone", ""));
            user.setLocation(userObject.optString("location", ""));
            user.setBrowser(userObject.optString("browser", ""));
            user.setPlatform(userObject.optString("platform", ""));
            user.setDevice(userObject.optString("device", ""));
            user.setIpAddress(userObject.optString("ipAddress", ""));
            user.setHostName(userObject.optString("hostName", ""));
            user.setUserAgent(userObject.optString("userAgent", ""));

            clientWrapper.updateUserInfo2(user, callback);
        } catch (JSONException e) {
            Utils.reportException(RNStringeeClientModule.class, e);
            callback.invoke(false, -2, "userInfo not in JSON format");
        }
    }

    @ReactMethod
    public void getUserInfo(final String uuid, final ReadableArray userIds, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isListEmpty(userIds)) {
            callback.invoke(false, -2, "userIds is unidentified or empty");
            return;
        }

        List<String> userIdList = new ArrayList<>();
        for (int i = 0; i < userIds.size(); i++) {
            userIdList.add(userIds.getString(i));
        }
        clientWrapper.getUserInfo(userIdList, callback);
    }

    @ReactMethod
    public void createLiveChatConversation(final String uuid, final String queueId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(queueId)) {
            callback.invoke(false, -2, "queueId is unidentified or empty");
            return;
        }

        clientWrapper.createLiveChatConversation(queueId, callback);
    }

    @ReactMethod
    public void acceptChatRequest(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.acceptChatRequest(convId, callback);
    }

    @ReactMethod
    public void rejectChatRequest(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.rejectChatRequest(convId, callback);
    }

    @ReactMethod
    public void createLiveChatTicket(final String uuid, final String widgetKey, final String name, final String email, final String phone, final String note, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(widgetKey)) {
            callback.invoke(false, -2, "widgetKey is unidentified or empty");
            return;
        }

        clientWrapper.createLiveChatTicket(widgetKey, name, email, note, phone, callback);
    }

    @ReactMethod
    public void sendChatTranscript(final String uuid, final String email, final String convId, final String domain, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.sendChatTranscript(convId, email, domain, callback);
    }

    @ReactMethod
    public void endChat(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.endChat(convId, callback);
    }

    @ReactMethod
    public void sendBeginTyping(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.sendBeginTyping(convId, callback);
    }

    @ReactMethod
    public void sendEndTyping(final String uuid, final String convId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        clientWrapper.sendEndTyping(convId, callback);
    }

    @ReactMethod
    public void pinMessage(final String uuid, final String convId, final String msgId, final boolean pinOrUnpin, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(msgId)) {
            callback.invoke(false, -2, "messageId is unidentified or empty");
            return;
        }

        String[] msgIds = new String[1];
        msgIds[0] = msgId;

        clientWrapper.pinMessage(convId, msgIds, pinOrUnpin, callback);
    }

    @ReactMethod
    public void editMessage(final String uuid, final String convId, final String msgId, final String newContent, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(msgId)) {
            callback.invoke(false, -2, "messageId is unidentified or empty");
            return;
        }

        String[] msgIds = new String[1];
        msgIds[0] = msgId;

        clientWrapper.editMessage(convId, msgIds, newContent, callback);
    }

    @ReactMethod
    public void revokeMessage(final String uuid, final String convId, final String msgId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(msgId)) {
            callback.invoke(false, -2, "messageId is unidentified or empty");
            return;
        }

        JSONArray msgArray = new JSONArray();
        msgArray.put(msgId);

        clientWrapper.revokeMessage(convId, msgArray, callback);
    }

    @ReactMethod
    public void getMessageById(final String uuid, final String convId, final String msgId, final Callback callback) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        if (Utils.isStringEmpty(convId)) {
            callback.invoke(false, -2, "convId is unidentified or empty");
            return;
        }

        if (Utils.isStringEmpty(msgId)) {
            callback.invoke(false, -2, "messageId is unidentified or empty");
            return;
        }

        String[] msgIds = new String[1];
        msgIds[0] = msgId;

        clientWrapper.getMessageById(convId, msgIds, callback);
    }

    @ReactMethod
    public void setNativeEvent(String uuid, String event) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper != null) {
            clientWrapper.setNativeEvent(event);
        }
    }

    @ReactMethod
    public void removeNativeEvent(String uuid, String event) {
        StringeeClientWrapper clientWrapper = StringeeManager.getInstance().getClientMap().get(uuid);
        if (clientWrapper != null) {
            clientWrapper.removeNativeEvent(event);
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
