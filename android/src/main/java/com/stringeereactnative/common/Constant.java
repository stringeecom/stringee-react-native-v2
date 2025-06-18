package com.stringeereactnative.common;

public class Constant {
    // Message
    public static String MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED = "StringeeClient is not initialized";
    public static String MESSAGE_STRINGEE_CLIENT_NOT_INITIALIZED_OR_CONNECTED = "StringeeClient is not initialized or connected";
    public static String MESSAGE_STRINGEE_CALL_NOT_INITIALIZED = "StringeeCall is not initialized";
    public static String MESSAGE_STRINGEE_CALL2_NOT_INITIALIZED = "StringeeCall2 is not initialized";
    public static String MESSAGE_STRINGEE_AUDIO_MANAGER_NOT_STARTED = "StringeeAudio is not started";

    // Key
    public static String KEY_UUID = "uuid";
    public static String KEY_DATA = "data";
    public static String KEY_USER_ID = "userId";
    public static String KEY_CALL_ID = "callId";
    public static String KEY_FROM = "from";
    public static String KEY_FROM_ALIAS = "fromAlias";
    public static String KEY_TO = "to";
    public static String KEY_TO_ALIAS = "toAlias";
    public static String KEY_CALL_TYPE = "callType";
    public static String KEY_IS_VIDEO_CALL = "isVideoCall";
    public static String KEY_CUSTOM_DATA_FROM_SERVER = "customDataFromYourServer";
    public static String KEY_CUSTOM_DATA = "customData";
    public static String KEY_VIDEO_RESOLUTION = "isVideoCall";
    public static String KEY_CODE = "code";
    public static String KEY_MESSAGE = "message";
    public static String KEY_OBJECT_TYPE = "objectType";
    public static String KEY_CHANGE_TYPE = "changeType";
    public static String KEY_OBJECTS = "objects";
    public static String KEY_REQUEST = "request";
    public static String KEY_CONV_ID = "convId";
    public static String KEY_CUSTOMER_ID = "customerId";
    public static String KEY_CUSTOMER_NAME = "customerName";
    public static String KEY_ENDED_BY = "endedby";
    public static String KEY_DISPLAY_NAME = "displayName";
    public static String KEY_REASON = "reason";
    public static String KEY_SIP_CODE = "sipCode";
    public static String KEY_SIP_REASON = "sipReason";
    public static String KEY_DESCRIPTION = "description";
    public static String KEY_SELECTED_AUDIO_DEVICE = "selectedAudioDevice";
    public static String KEY_AVAILABLE_AUDIO_DEVICE = "availableAudioDevices";
    public static String KEY_MEDIA_TYPE = "mediaType";
    public static String KEY_ENABLE = "enable";
    public static String KEY_VIDEO_TRACK = "videoTrack";
    public static String KEY_AUDIO_TYPE = "type";

    // Client events
    public static String CLIENT_ON_CONNECTED = "onConnectionConnected";
    public static String CLIENT_ON_DISCONNECTED = "onConnectionDisconnected";
    public static String CLIENT_ON_INCOMING_CALL = "onIncomingCall";
    public static String CLIENT_ON_INCOMING_CALL2 = "onIncomingCall2";
    public static String CLIENT_ON_CONNECTION_ERROR = "onConnectionError";
    public static String CLIENT_ON_REQUEST_NEW_TOKEN = "onRequestNewToken";
    public static String CLIENT_ON_CUSTOM_MESSAGE = "onCustomMessage";
    public static String CLIENT_ON_TOPIC_MESSAGE = "onTopicMessage";
    public static String CLIENT_ON_CHANGE = "onChangeEvent";
    public static String CLIENT_ON_RECEIVE_CHAT_REQUEST = "onReceiveChatRequest";
    public static String CLIENT_ON_RECEIVE_TRANSFER_CHAT_REQUEST = "onReceiveTransferChatRequest";
    public static String CLIENT_ON_TIME_OUT_ANSWER_CHAT = "onTimeoutAnswerChat";
    public static String CLIENT_ON_TIME_OUT_IN_QUEUE = "onTimeoutInQueue";
    public static String CLIENT_ON_CONVERSATION_END = "onConversationEnded";
    public static String CLIENT_ON_TYPING = "onTyping";
    public static String CLIENT_ON_END_TYPING = "onEndTyping";

    // Call event
    public static String CALL_ON_SIGNALING_STATE_CHANGE = "onSignalingStateChange";
    public static String CALL_ON_HANDLE_ON_ANOTHER_DEVICE = "onHandledOnAnotherDevice";
    public static String CALL_ON_MEDIA_STATE_CHANGE = "onMediaStateChange";
    public static String CALL_ON_LOCAL_STREAM = "onLocalStream";
    public static String CALL_ON_REMOTE_STREAM = "onRemoteStream";
    public static String CALL_ON_CALL_INFO = "onCallInfo";

    // Call2 event
    public static String CALL2_ON_SIGNALING_STATE_CHANGE = "onSignalingStateChange";
    public static String CALL2_ON_HANDLE_ON_ANOTHER_DEVICE = "onHandledOnAnotherDevice";
    public static String CALL2_ON_MEDIA_STATE_CHANGE = "onMediaStateChange";
    public static String CALL2_ON_LOCAL_TRACK_ADDED = "onLocalTrackAdded";
    public static String CALL2_ON_REMOTE_TRACK_ADDED = "onRemoteTrackAdded";
    public static String CALL2_ON_CALL_INFO = "onCallInfo";
    public static String CALL2_ON_TRACK_MEDIA_STATE_CHANGE = "onTrackMediaStateChange";

    // Audio event
    public static String AUDIO_ON_AUDIO_DEVICE_CHANGE = "onAudioDeviceChange";
}
