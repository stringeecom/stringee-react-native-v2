package com.stringeereactnative.wrapper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.stringee.StringeeClient;
import com.stringee.call.StringeeCall;
import com.stringee.call.StringeeCall2;
import com.stringee.common.SocketAddress;
import com.stringee.exception.StringeeError;
import com.stringee.listener.StatusListener;
import com.stringee.listener.StringeeConnectionListener;
import com.stringee.messaging.ChatProfile;
import com.stringee.messaging.ChatRequest;
import com.stringee.messaging.Conversation;
import com.stringee.messaging.ConversationOptions;
import com.stringee.messaging.Message;
import com.stringee.messaging.StringeeChange;
import com.stringee.messaging.StringeeObject;
import com.stringee.messaging.User;
import com.stringee.messaging.listeners.CallbackListener;
import com.stringee.messaging.listeners.ChangeEventListener;
import com.stringee.messaging.listeners.LiveChatEventListener;
import com.stringee.messaging.listeners.UserTypingEventListener;
import com.stringeereactnative.common.Constant;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class StringeeClientWrapper implements StringeeConnectionListener, ChangeEventListener, LiveChatEventListener, UserTypingEventListener {
    private final List<String> events = new ArrayList<>();
    private StringeeClient stringeeClient;
    private final ReactContext reactContext;
    private final String uuid;

    public StringeeClientWrapper(String uuid, ReactContext reactContext) {
        this.uuid = uuid;
        this.reactContext = reactContext;
    }

    @Override
    public void onConnectionConnected(StringeeClient stringeeClient, boolean isReconnecting) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_CONNECTED)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_USER_ID, stringeeClient.getUserId());
            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CONNECTED, eventData);
        }
    }

    @Override
    public void onConnectionDisconnected(StringeeClient stringeeClient, boolean b) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_DISCONNECTED)) {
            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_DISCONNECTED, eventData);
        }
    }

    @Override
    public void onIncomingCall(StringeeCall stringeeCall) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_INCOMING_CALL)) {
            // Data
            String callUuid = UUID.randomUUID().toString();
            StringeeCallWrapper callWrapper = new StringeeCallWrapper(callUuid, reactContext);
            callWrapper.setStringeeCall(stringeeCall);
            callWrapper.setClientWrapper(this);
            StringeeManager.getInstance().getCallMap().put(callUuid, callWrapper);
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall.getCallId());
            data.putString(Constant.KEY_UUID, callUuid);
            data.putString(Constant.KEY_FROM, stringeeCall.getFrom());
            data.putString(Constant.KEY_FROM_ALIAS, stringeeCall.getFromAlias());
            data.putString(Constant.KEY_TO, stringeeCall.getTo());
            data.putString(Constant.KEY_TO_ALIAS, stringeeCall.getToAlias());
            data.putInt(Constant.KEY_CALL_TYPE, stringeeCall.isPhoneToAppCall() ? 3 : 1);
            data.putBoolean(Constant.KEY_IS_VIDEO_CALL, stringeeCall.isVideoCall());
            data.putString(Constant.KEY_CUSTOM_DATA_FROM_SERVER,
                    stringeeCall.getCustomDataFromYourServer());

            // Event data
            WritableMap params = Arguments.createMap();
            params.putString(Constant.KEY_UUID, uuid);
            params.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_INCOMING_CALL, params);
        }
    }

    @Override
    public void onIncomingCall2(StringeeCall2 stringeeCall2) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_INCOMING_CALL2)) {
            // Data
            String callUuid = UUID.randomUUID().toString();
            StringeeCall2Wrapper call2Wrapper = new StringeeCall2Wrapper(callUuid, reactContext);
            call2Wrapper.setStringeeCall2(stringeeCall2);
            call2Wrapper.setClientWrapper(this);
            StringeeManager.getInstance().getCall2Map().put(callUuid, call2Wrapper);
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CALL_ID, stringeeCall2.getCallId());
            data.putString(Constant.KEY_UUID, callUuid);
            data.putString(Constant.KEY_FROM, stringeeCall2.getFrom());
            data.putString(Constant.KEY_FROM_ALIAS, stringeeCall2.getFromAlias());
            data.putString(Constant.KEY_TO, stringeeCall2.getTo());
            data.putString(Constant.KEY_TO_ALIAS, stringeeCall2.getToAlias());
            data.putInt(Constant.KEY_CALL_TYPE, 1);
            data.putBoolean(Constant.KEY_IS_VIDEO_CALL, stringeeCall2.isVideoCall());
            data.putString(Constant.KEY_CUSTOM_DATA_FROM_SERVER,
                    stringeeCall2.getCustomDataFromYourServer());

            // Event data
            WritableMap params = Arguments.createMap();
            params.putString(Constant.KEY_UUID, uuid);
            params.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_INCOMING_CALL2, params);
        }
    }

    @Override
    public void onConnectionError(StringeeClient stringeeClient, StringeeError stringeeError) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_CONNECTION_ERROR)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putInt(Constant.KEY_CODE, stringeeError.getCode());
            data.putString(Constant.KEY_MESSAGE, stringeeError.getMessage());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CONNECTION_ERROR, eventData);
        }
    }

    @Override
    public void onRequestNewToken(StringeeClient stringeeClient) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_REQUEST_NEW_TOKEN)) {
            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_REQUEST_NEW_TOKEN, eventData);
        }
    }

    @Override
    public void onCustomMessage(String from, JSONObject jsonObject) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_CUSTOM_MESSAGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_FROM, from);
            data.putString(Constant.KEY_DATA, jsonObject.toString());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CUSTOM_MESSAGE, eventData);
        }
    }

    @Override
    public void onTopicMessage(String from, JSONObject jsonObject) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_TOPIC_MESSAGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_FROM, from);
            data.putString(Constant.KEY_DATA, jsonObject.toString());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_TOPIC_MESSAGE, eventData);
        }
    }

    @Override
    public void onChangeEvent(StringeeChange stringeeChange) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_CHANGE)) {
            // Data
            WritableMap data = Arguments.createMap();
            StringeeObject.Type objectType = stringeeChange.getObjectType();
            data.putInt(Constant.KEY_OBJECT_TYPE, objectType.getValue());
            data.putInt(Constant.KEY_CHANGE_TYPE, stringeeChange.getChangeType().getValue());
            WritableArray objects = Arguments.createArray();
            switch (objectType) {
                case MESSAGE:
                    objects.pushMap(Utils.getMessageMap((Message) stringeeChange.getObject()));
                    break;
                case CONVERSATION:
                    objects.pushMap(
                            Utils.getConversationMap((Conversation) stringeeChange.getObject()));
                    break;
            }
            data.putArray(Constant.KEY_OBJECTS, objects);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CHANGE, eventData);
        }
    }

    @Override
    public void onReceiveChatRequest(ChatRequest chatRequest) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_RECEIVE_CHAT_REQUEST)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_REQUEST, Utils.getChatRequestMap(chatRequest));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_RECEIVE_CHAT_REQUEST, eventData);
        }
    }

    @Override
    public void onReceiveTransferChatRequest(ChatRequest chatRequest) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_RECEIVE_TRANSFER_CHAT_REQUEST)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_REQUEST, Utils.getChatRequestMap(chatRequest));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_RECEIVE_TRANSFER_CHAT_REQUEST,
                    eventData);
        }
    }

    @Override
    public void onHandleOnAnotherDevice(ChatRequest chatRequest, ChatRequest.State state) {

    }

    @Override
    public void onTimeoutAnswerChat(ChatRequest chatRequest) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_TIME_OUT_ANSWER_CHAT)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putMap(Constant.KEY_REQUEST, Utils.getChatRequestMap(chatRequest));

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_TIME_OUT_ANSWER_CHAT, eventData);
        }
    }

    @Override
    public void onTimeoutInQueue(Conversation conversation) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_TIME_OUT_IN_QUEUE)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CONV_ID, conversation.getId());
            User user = stringeeClient.getUser(stringeeClient.getUserId());
            data.putString(Constant.KEY_CUSTOMER_ID, user.getUserId());
            data.putString(Constant.KEY_CUSTOMER_NAME, user.getName());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_TIME_OUT_IN_QUEUE, eventData);
        }
    }

    @Override
    public void onConversationEnded(Conversation conversation, User user) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_CONVERSATION_END)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CONV_ID, conversation.getId());
            data.putString(Constant.KEY_ENDED_BY, user.getUserId());

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CONVERSATION_END, eventData);
        }
    }

    @Override
    public void onTyping(Conversation conversation, User user) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_TYPING)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CONV_ID, conversation.getId());
            data.putString(Constant.KEY_USER_ID, user.getUserId());
            String userName = user.getName();
            if (Utils.isStringEmpty(userName)) {
                userName = user.getUserId();
            }
            data.putString(Constant.KEY_DISPLAY_NAME, userName);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_TYPING, eventData);
        }
    }

    @Override
    public void onEndTyping(Conversation conversation, User user) {
        if (Utils.containsEvent(events, Constant.CLIENT_ON_END_TYPING)) {
            // Data
            WritableMap data = Arguments.createMap();
            data.putString(Constant.KEY_CONV_ID, conversation.getId());
            data.putString(Constant.KEY_USER_ID, user.getUserId());
            String userName = user.getName();
            if (Utils.isStringEmpty(userName)) {
                userName = user.getUserId();
            }
            data.putString(Constant.KEY_DISPLAY_NAME, userName);

            // Event data
            WritableMap eventData = Arguments.createMap();
            eventData.putString(Constant.KEY_UUID, uuid);
            eventData.putMap(Constant.KEY_DATA, data);
            Utils.sendEvent(reactContext, Constant.CLIENT_ON_END_TYPING, eventData);
        }
    }

    public void setNativeEvent(final String event) {
        if (!Utils.isStringEmpty(event)) {
            events.add(event);
        }
    }

    public void removeNativeEvent(final String event) {
        if (!Utils.isStringEmpty(event)) {
            events.remove(event);
        }
    }

    public boolean isConnected() {
        if (stringeeClient != null) {
            return stringeeClient.isConnected();
        }
        return false;
    }

    public StringeeClient getStringeeClient() {
        return stringeeClient;
    }

    public void initializeStringeeClient(final List<SocketAddress> socketAddresses,
                                         final String baseUrl, final String stringeeXBaseUrl) {
        stringeeClient = new StringeeClient(reactContext);
        // Set socket address
        if (!Utils.isListEmpty(socketAddresses)) {
            stringeeClient.setHost(socketAddresses);
        }
        // Set base url
        if (!Utils.isStringEmpty(baseUrl)) {
            stringeeClient.setBaseAPIUrl(baseUrl);
        }
        // Set stringeex base url
        if (!Utils.isStringEmpty(stringeeXBaseUrl)) {
            stringeeClient.setStringeeXBaseUrl(stringeeXBaseUrl);
        }
        // Set listener
        stringeeClient.setConnectionListener(this);
        stringeeClient.setChangeEventListener(this);
        stringeeClient.setLiveChatEventListener(this);
        stringeeClient.setUserTypingEventListener(this);
    }

    public void connect(final String accessToken) {
        if (stringeeClient != null) {
            if (stringeeClient.isConnected()) {
                if (Utils.containsEvent(events, Constant.CLIENT_ON_CONNECTED)) {
                    // Data
                    WritableMap data = Arguments.createMap();
                    data.putString(Constant.KEY_USER_ID, stringeeClient.getUserId());
                    // Event data
                    WritableMap eventData = Arguments.createMap();
                    eventData.putString(Constant.KEY_UUID, uuid);
                    eventData.putMap(Constant.KEY_DATA, data);
                    Utils.sendEvent(reactContext, Constant.CLIENT_ON_CONNECTED, eventData);
                }
            } else {
                stringeeClient.connect(accessToken);
            }
        }
    }

    public void disconnect() {
        if (stringeeClient != null) {
            stringeeClient.disconnect();
        }
    }

    public void registerPushToken(final String token, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.registerPushToken(token, new StatusListener() {
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

    public void registerPushAndDeleteOthers(final String token, final List<String> packages,
                                            final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.registerPushTokenAndDeleteOthers(token, packages, new StatusListener() {
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

    public void unregisterPushToken(final String token, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.unregisterPushToken(token, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void sendCustomMessage(final String toUser, final JSONObject jsonObject,
                                  final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.sendCustomMessage(toUser, jsonObject, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void createConversation(final List<User> participants,
                                   final ConversationOptions convOptions, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.createConversation(participants, convOptions, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                WritableMap params = Utils.getConversationMap(conversation);
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getConversationById(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                WritableMap params = Utils.getConversationMap(conversation);
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getLocalConversations(final String userId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getLocalConversations(userId, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getLastConversations(final int count, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getLastConversations(count, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getConversationsBefore(final double datetime, final int count,
                                       final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationsBefore((long) datetime, count, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getConversationsAfter(final double datetime, final int count,
                                      final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationsAfter((long) datetime, count, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void deleteConversation(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(final Conversation conversation) {
                if (conversation.isGroup()) {
                    if (conversation.getState() != Conversation.State.LEFT) {
                        callback.invoke(false, -2, "You must leave this group before deleting");
                        return;
                    }
                }
                conversation.delete(stringeeClient, new StatusListener() {
                    @Override
                    public void onSuccess() {
                        callback.invoke(true, 0, "Success");
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void addParticipants(final String convId, final List<User> users,
                                final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.addParticipants(stringeeClient, users, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<User> users) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < users.size(); i++) {
                            WritableMap param = Utils.getUserMap(users.get(i));
                            params.pushMap(param);
                        }

                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void removeParticipants(final String convId, final List<User> users,
                                   final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.removeParticipants(stringeeClient, users, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<User> users) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < users.size(); i++) {
                            WritableMap param = Utils.getUserMap(users.get(i));
                            params.pushMap(param);
                        }

                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void sendMessage(final String convId, final Message message, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.sendMessage(stringeeClient, message, new StatusListener() {
                    @Override
                    public void onSuccess() {
                        callback.invoke(true, 0, "Success");
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());

                        if (Utils.containsEvent(events, Constant.CLIENT_ON_CHANGE)) {
                            // Data
                            WritableMap data = Arguments.createMap();
                            data.putInt(Constant.KEY_OBJECT_TYPE,
                                    StringeeObject.Type.MESSAGE.getValue());
                            data.putInt(Constant.KEY_CHANGE_TYPE,
                                    StringeeChange.Type.DELETE.getValue());
                            WritableArray objects = Arguments.createArray();
                            objects.pushMap(Utils.getMessageMap(message));
                            data.putArray(Constant.KEY_OBJECTS, objects);

                            // Event data
                            WritableMap eventData = Arguments.createMap();
                            eventData.putString(Constant.KEY_UUID, uuid);
                            eventData.putMap(Constant.KEY_DATA, data);
                            Utils.sendEvent(reactContext, Constant.CLIENT_ON_CHANGE, eventData);
                        }
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getLocalMessages(final String convId, final int count, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getLocalMessages(stringeeClient, count, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Message> messages) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < messages.size(); i++) {
                            WritableMap param = Utils.getMessageMap(messages.get(i));
                            params.pushMap(param);
                        }
                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getLastMessages(final String convId, final int count, final boolean loadDeletedMsg,
                                final boolean loadDeletedMsgContent, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getLastMessages(stringeeClient, count, loadDeletedMsg,
                        loadDeletedMsgContent, false, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getMessagesAfter(final String convId, final int sequence, final int count,
                                 final boolean loadDeletedMsg, final boolean loadDeletedMsgContent,
                                 final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessagesAfter(stringeeClient, sequence, count, loadDeletedMsg,
                        loadDeletedMsgContent, false, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getMessagesBefore(final String convId, final int sequence, final int count,
                                  final boolean loadDeletedMsg, final boolean loadDeletedMsgContent,
                                  final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessagesBefore(stringeeClient, sequence, count, loadDeletedMsg,
                        loadDeletedMsgContent, false, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void deleteMessage(final String convId, final JSONArray messageIds,
                              final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.deleteMessages(convId, messageIds, new StatusListener() {
            @Override
            public void onSuccess() {
                callback.invoke(true, 0, "Success");
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void markConversationAsRead(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.markAllAsRead(stringeeClient, new StatusListener() {
                    @Override
                    public void onSuccess() {
                        callback.invoke(true, 0, "Success");
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }
        });
    }

    public void clearDb(final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }
        stringeeClient.clearDb();
        callback.invoke(true, 0, "Success");
    }

    public void updateConversation(final String convId, final String name, final String avatar,
                                   final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.updateConversation(stringeeClient, name, avatar, new StatusListener() {
                    @Override
                    public void onSuccess() {
                        callback.invoke(true, 0, "Success");
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getConversationWithUser(final String userId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationByUserId(userId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                WritableMap params = Utils.getConversationMap(conversation);
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getUnreadConversationCount(final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getTotalUnread(new CallbackListener<>() {
            @Override
            public void onSuccess(Integer count) {
                callback.invoke(true, 0, "Success", count);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getLastUnreadConversations(final int count, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getLastUnreadConversations(count, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getUnreadConversationsBefore(final double datetime, final int count,
                                             final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getUnreadConversationsBefore((long) datetime, count,
                new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Conversation> conversations) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < conversations.size(); i++) {
                            WritableMap param = Utils.getConversationMap(conversations.get(i));
                            params.pushMap(param);
                        }
                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
    }

    public void getUnreadConversationsAfter(final double datetime, final int count,
                                            final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getUnreadConversationsAfter((long) datetime, count,
                new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Conversation> conversations) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < conversations.size(); i++) {
                            WritableMap param = Utils.getConversationMap(conversations.get(i));
                            params.pushMap(param);
                        }
                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
    }

    public void getAllLastConversations(final int count, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getLastConversations(count, true, new CallbackListener<>() {
            @Override
            public void onSuccess(List<Conversation> conversations) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < conversations.size(); i++) {
                    WritableMap param = Utils.getConversationMap(conversations.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getAllConversationsBefore(final double datetime, final int count,
                                          final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationsBefore((long) datetime, count, true,
                new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Conversation> conversations) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < conversations.size(); i++) {
                            WritableMap param = Utils.getConversationMap(conversations.get(i));
                            params.pushMap(param);
                        }
                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
    }

    public void getAllConversationsAfter(final double datetime, final int count,
                                         final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationsAfter((long) datetime, count, true,
                new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Conversation> conversations) {
                        WritableArray params = Arguments.createArray();
                        for (int i = 0; i < conversations.size(); i++) {
                            WritableMap param = Utils.getConversationMap(conversations.get(i));
                            params.pushMap(param);
                        }
                        callback.invoke(true, 0, "Success", params);
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
    }

    public void getAllLastMessages(final String convId, final int count,
                                   final boolean loadDeletedMsg,
                                   final boolean loadDeletedMsgContent, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getLastMessages(stringeeClient, count, loadDeletedMsg,
                        loadDeletedMsgContent, true, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getAllMessagesAfter(final String convId, final int sequence, final int count,
                                    final boolean loadDeletedMsg,
                                    final boolean loadDeletedMsgContent, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessagesAfter(stringeeClient, sequence, count, loadDeletedMsg,
                        loadDeletedMsgContent, true, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getAllMessagesBefore(final String convId, final int sequence, final int count,
                                     final boolean loadDeletedMsg,
                                     final boolean loadDeletedMsgContent, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessagesBefore(stringeeClient, sequence, count, loadDeletedMsg,
                        loadDeletedMsgContent, true, new CallbackListener<>() {
                            @Override
                            public void onSuccess(List<Message> messages) {
                                WritableArray params = Arguments.createArray();
                                for (int i = 0; i < messages.size(); i++) {
                                    WritableMap param = Utils.getMessageMap(messages.get(i));
                                    params.pushMap(param);
                                }
                                callback.invoke(true, 0, "Success", params);
                            }

                            @Override
                            public void onError(StringeeError error) {
                                callback.invoke(false, error.getCode(), error.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }

    public void getChatProfile(final String widgetKey, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getChatProfile(widgetKey, new CallbackListener<>() {
            @Override
            public void onSuccess(ChatProfile chatProfile) {
                WritableMap params = Utils.getChatProfileMap(chatProfile);
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void getLiveChatToken(final String widgetKey, final String name, final String email,
                                 final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getLiveChatToken(widgetKey, name, email, new CallbackListener<>() {
            @Override
            public void onSuccess(String token) {
                callback.invoke(true, 0, "Success", token);
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void updateUserInfo(final String name, final String email, final String avatar,
                               final String phone, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.updateUser(name, email, avatar, phone, new StatusListener() {
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

    public void updateUserInfo2(final User user, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.updateUser(user, new StatusListener() {
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

    public void getUserInfo(final List<String> userIdList, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getUserInfo(userIdList, new CallbackListener<>() {
            @Override
            public void onSuccess(List<User> users) {
                WritableArray params = Arguments.createArray();
                for (int i = 0; i < users.size(); i++) {
                    WritableMap param = Utils.getUserMap(users.get(i));
                    params.pushMap(param);
                }
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void createLiveChatConversation(final String queueId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.createLiveChat(queueId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                WritableMap params = Utils.getConversationMap(conversation);
                callback.invoke(true, 0, "Success", params);
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void acceptChatRequest(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getChatRequests(new CallbackListener<>() {
            @Override
            public void onSuccess(List<ChatRequest> chatRequestList) {
                for (int i = 0; i < chatRequestList.size(); i++) {
                    ChatRequest chatRequest = chatRequestList.get(i);
                    if (convId.equals(chatRequest.getConvId())) {
                        chatRequest.accept(stringeeClient, new CallbackListener<>() {
                            @Override
                            public void onSuccess(Conversation conversation) {
                                callback.invoke(true, 0, "Success");
                            }

                            @Override
                            public void onError(StringeeError stringeeError) {
                                super.onError(stringeeError);
                                callback.invoke(false, stringeeError.getCode(),
                                        stringeeError.getMessage());
                            }
                        });
                        break;
                    }
                }
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void rejectChatRequest(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getChatRequests(new CallbackListener<>() {
            @Override
            public void onSuccess(List<ChatRequest> chatRequestList) {
                for (int i = 0; i < chatRequestList.size(); i++) {
                    ChatRequest chatRequest = chatRequestList.get(i);
                    if (convId.equals(chatRequest.getConvId())) {
                        chatRequest.reject(stringeeClient, new StatusListener() {
                            @Override
                            public void onSuccess() {
                                callback.invoke(true, 0, "Success");
                            }

                            @Override
                            public void onError(StringeeError stringeeError) {
                                super.onError(stringeeError);
                                callback.invoke(false, stringeeError.getCode(),
                                        stringeeError.getMessage());
                            }
                        });
                        break;
                    }
                }
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void createLiveChatTicket(final String widgetKey, final String name, final String email,
                                     final String phone, final String note,
                                     final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.createLiveChatTicket(widgetKey, name, email, note, phone,
                new StatusListener() {
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

    public void sendChatTranscript(final String email, final String convId, final String domain,
                                   final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.sendChatTranscriptTo(stringeeClient, email, domain,
                        new StatusListener() {
                            @Override
                            public void onSuccess() {
                                callback.invoke(true, 0, "Success");
                            }

                            @Override
                            public void onError(StringeeError stringeeError) {
                                super.onError(stringeeError);
                                callback.invoke(false, stringeeError.getCode(),
                                        stringeeError.getMessage());
                            }
                        });
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void endChat(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.endChat(stringeeClient, new StatusListener() {
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

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void sendBeginTyping(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.beginTyping(stringeeClient, new StatusListener() {
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

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void sendEndTyping(final String convId, final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.endTyping(stringeeClient, new StatusListener() {
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

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void pinMessage(final String convId, final String[] msgIds, final boolean pinOrUnpin,
                           final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }
        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessages(stringeeClient, msgIds, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Message> messages) {
                        messages.get(0)
                                .pinOrUnpin(stringeeClient, pinOrUnpin, new StatusListener() {
                                    @Override
                                    public void onSuccess() {
                                        callback.invoke(true, 0, "Success");
                                    }

                                    @Override
                                    public void onError(StringeeError stringeeError) {
                                        super.onError(stringeeError);
                                        callback.invoke(false, stringeeError.getCode(),
                                                stringeeError.getMessage());
                                    }
                                });
                    }

                    @Override
                    public void onError(StringeeError stringeeError) {
                        super.onError(stringeeError);
                        callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void editMessage(final String convId, final String[] msgIds, final String newContent,
                            final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessages(stringeeClient, msgIds, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Message> messages) {
                        messages.get(0).edit(stringeeClient, newContent, new StatusListener() {
                            @Override
                            public void onSuccess() {
                                callback.invoke(true, 0, "Success");
                            }

                            @Override
                            public void onError(StringeeError stringeeError) {
                                super.onError(stringeeError);
                                callback.invoke(false, stringeeError.getCode(),
                                        stringeeError.getMessage());
                            }
                        });
                    }

                    @Override
                    public void onError(StringeeError stringeeError) {
                        super.onError(stringeeError);
                        callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError stringeeError) {
                super.onError(stringeeError);
                callback.invoke(false, stringeeError.getCode(), stringeeError.getMessage());
            }
        });
    }

    public void revokeMessage(final String convId, final JSONArray msgArray,
                              final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.revokeMessages(convId, msgArray, true, new StatusListener() {
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

    public void getMessageById(final String convId, final String[] msgIds,
                               final Callback callback) {
        if (stringeeClient == null) {
            callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED);
            return;
        }

        stringeeClient.getConversationFromServer(convId, new CallbackListener<>() {
            @Override
            public void onSuccess(Conversation conversation) {
                conversation.getMessages(stringeeClient, msgIds, new CallbackListener<>() {
                    @Override
                    public void onSuccess(List<Message> messages) {
                        if (!messages.isEmpty()) {
                            WritableMap param = Utils.getMessageMap(messages.get(0));
                            callback.invoke(true, 0, "Success", param);
                        }
                    }

                    @Override
                    public void onError(StringeeError error) {
                        callback.invoke(false, error.getCode(), error.getMessage());
                    }
                });
            }

            @Override
            public void onError(StringeeError error) {
                callback.invoke(false, error.getCode(), error.getMessage());
            }
        });
    }
}
