import React from 'react';
import {
  ChatRequest,
  Conversation,
  Message,
  StringeeCall,
  StringeeCall2,
  StringeeClient,
  StringeeClientListener,
  StringeeVideoScalingType,
  StringeeVideoView,
  User,
  type StringeeCall2Options,
  type StringeeCallOptions,
  type StringeeClientOptions,
  type StringeeVideoViewProps,
} from 'stringee-react-native-v2';

const client = new StringeeClient();
const clientOptions: StringeeClientOptions = {
  baseUrl: 'https://example.com',
  serverAddresses: [],
  stringeeXBaseUrl: 'https://x.example.com',
};
const configuredClient = new StringeeClient(clientOptions);

const callOptions: StringeeCallOptions = {
  from: 'alice',
  stringeeClient: client,
  to: 'bob',
};
const call = new StringeeCall(callOptions);

const call2Options: StringeeCall2Options = {
  from: 'alice',
  stringeeClient: configuredClient,
  to: 'bob',
};
const call2 = new StringeeCall2(call2Options);

const listener = new StringeeClientListener();
listener.onConnect = (connectedClient, userId) => {
  connectedClient.userId = userId;
};
client.setListener(listener);
client.setListener({
  onIncomingCall: (_connectedClient, incomingCall) => incomingCall.answer(),
});
call.setListener({
  onReceiveRemoteStream: activeCall => activeCall.hangup(),
});
call2.setListener({
  onReceiveLocalTrack: (_activeCall, track) => track.serverId,
});

const user = new User({userId: 'alice'});
const message = new Message({
  conversationId: 'conversation-id',
  id: 'message-id',
  stringeeClient: client,
});
const conversation = new Conversation({
  id: 'conversation-id',
  participants: [user],
  stringeeClient: client,
});
const chatRequest = new ChatRequest({
  convId: conversation.id,
  stringeeClient: client,
});
const pinResult: Promise<void> = message.pinMessage(true);
const acceptResult: Promise<void> = chatRequest.acceptChatRequest();

const videoViewProps: StringeeVideoViewProps = {
  local: true,
  scalingType: StringeeVideoScalingType.fill,
  style: [{height: 120}, {width: 160}],
  uuid: call.uuid,
};
const view = (
  <StringeeVideoView
    {...videoViewProps}
  />
);

void call2;
void acceptResult;
void pinResult;
void view;

// @ts-expect-error `to` is required for outgoing calls.
new StringeeCall({from: 'alice', stringeeClient: client});

// @ts-expect-error callback userId is a string, not a number.
listener.onConnect = (_connectedClient, userId: number) => String(userId);
