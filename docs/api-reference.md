# API Reference

This document lists every class and type exported from `stringee-react-native-v2` and explains what each one is for. For method-level details, refer to the JSDoc comments in the source files linked from each section.

## Table of contents

- [Core](#core)
  - [StringeeClient](#stringeeclient)
  - [StringeeCall](#stringeecall)
  - [StringeeCall2](#stringeecall2)
  - [StringeeVideoView](#stringeevideoview)
- [Listeners](#listeners)
  - [StringeeClientListener](#stringeeclientlistener)
  - [StringeeCallListener](#stringeecalllistener)
  - [StringeeCall2Listener](#stringeecall2listener)
- [Chat objects](#chat-objects)
  - [Conversation](#conversation)
  - [Message](#message)
  - [User](#user)
  - [ChatRequest](#chatrequest)
- [Video objects](#video-objects)
  - [StringeeVideoTrack](#stringeevideotrack)
  - [StringeeRoomUser](#stringeeroomuser)
- [Helper / parameter objects](#helper--parameter-objects)
  - [StringeeServerAddress](#stringeeserveraddress)
  - [ConversationOption](#conversationoption)
  - [ConversationInfo](#conversationinfo)
  - [UserInfo](#userinfo)
  - [NewMessageInfo](#newmessageinfo)
  - [LiveChatTicketParam](#livechatticketparam)
  - [StringeeError](#stringeeerror)
- [Enums](#enums)

---

## Core

### StringeeClient

[`src/StringeeClient.js`](../src/StringeeClient.js)

The entry point of the SDK. A `StringeeClient` represents a connection to the Stringee server and exposes APIs for authentication, presence, push tokens, conversations, messages, live chat, and incoming-call dispatch.

Typical lifecycle:

1. Create one `StringeeClient` per logged-in user.
2. Attach a `StringeeClientListener` via `setListener(...)` to receive connection state, incoming calls, and chat events.
3. Call `connect(accessToken)` to authenticate against the Stringee server.
4. When done, call `disconnect()`.

Key responsibilities:

- Connection: `connect`, `disconnect`, `isConnected`, `setListener`.
- Push token: `registerPushToken`, `registerPushAndDeleteOthers`, `unregisterPushToken`.
- Custom messaging: `sendCustomMessage`.
- Conversations & messages: create / fetch / update / delete conversations and messages, mark as read, send typing events.
- Live chat: `getChatProfile`, `getLiveChatToken`, `createLiveChatTicket`, `acceptChatRequest`, `rejectChatRequest`, `sendChatTranscript`, `endChat`.
- User info: `getUserInfo`, `updateUserInfo`.

### StringeeCall

[`src/call/StringeeCall.js`](../src/call/StringeeCall.js)

A 1-to-1 call. Use this for app-to-app, app-to-phone, and phone-to-app voice / video calls.

Construction:

```js
const call = new StringeeCall({stringeeClient, from, to});
call.isVideoCall = true;            // optional
call.videoResolution = VideoResolution.hd;
call.setListener(callListener);
await call.makeCall();
```

For incoming calls, the SDK creates the `StringeeCall` for you — you receive it through `StringeeClientListener.onIncomingCall`.

Key responsibilities:

- Call control: `makeCall`, `initAnswer`, `answer`, `reject`, `hangup`.
- Media: `mute`, `enableVideo`, `switchCamera`, `setSpeakerphoneOn`, `resumeVideo`, `getCallStats`.
- Signaling: `sendDTMF`, `sendCallInfo`.
- Listener: `setListener(StringeeCallListener)`.

### StringeeCall2

[`src/call/StringeeCall2.js`](../src/call/StringeeCall2.js)

A second-generation 1-to-1 call that uses `StringeeVideoTrack` for media instead of raw streams. The control surface mirrors `StringeeCall` but the rendering model is track-based, which interoperates with `StringeeVideoView` and the conference room SDK.

Use `StringeeCall2` when:

- You want consistent track handling between 1-to-1 and conference scenarios.
- You need the `onTrackMediaStateChange` event to react to the remote side toggling audio / video.

### StringeeVideoView

[`src/StringeeVideoView.js`](../src/StringeeVideoView.js)

A React component that renders a video stream / track from a call. It is a thin wrapper over a native view (`RNStringeeVideoView`).

Props:

- `uuid` *(string)* — the `uuid` of the owning `StringeeCall` / `StringeeCall2`. Required when rendering streams from `StringeeCall`.
- `local` *(bool)* — `true` to render the local stream, `false` for the remote stream. Defaults to `false`. Used together with `uuid`.
- `videoTrack` *(StringeeVideoTrack)* — when rendering a `StringeeCall2` track, pass the track object instead of (or in addition to) `local`.
- `scalingType` *(StringeeVideoScalingType)* — `fit` letterboxes; `fill` (default) crops to fill the view.
- `style` — standard React Native style object. The width / height drive the underlying surface size.

---

## Listeners

Listeners are plain JS objects whose properties are callback functions. Attach one via `setListener(...)` on the corresponding object. Any callback you do not assign is simply not invoked.

### StringeeClientListener

[`src/listener/StringeeClientListener.js`](../src/listener/StringeeClientListener.js)

Connection lifecycle, incoming calls, custom messages, and chat events:

- `onConnect`, `onDisConnect`, `onFailWithError`, `onRequestAccessToken`
- `onIncomingCall`, `onIncomingCall2`
- `onCustomMessage`, `onObjectChange`
- `onReceiveChatRequest`, `onReceiveTransferChatRequest`, `onTimeoutAnswerChat`, `onTimeoutInQueue`, `onConversationEnded`
- `onUserBeginTyping`, `onUserEndTyping`

### StringeeCallListener

[`src/listener/StringeeCallListener.js`](../src/listener/StringeeCallListener.js)

Events for `StringeeCall`:

- `onChangeSignalingState`, `onChangeMediaState`
- `onReceiveLocalStream`, `onReceiveRemoteStream`
- `onReceiveDtmfDigit`, `onReceiveCallInfo`
- `onHandleOnAnotherDevice`
- `onAudioDeviceChange` *(Android only)*

### StringeeCall2Listener

[`src/listener/StringeeCall2Listener.js`](../src/listener/StringeeCall2Listener.js)

Same shape as `StringeeCallListener`, but the local / remote events emit `StringeeVideoTrack` instead of generic streams, and there is an extra `onTrackMediaStateChange` callback when the peer toggles a track.

---

## Chat objects

### Conversation

[`src/chat/Conversation.js`](../src/chat/Conversation.js)

Represents a 1-to-1 or group conversation. Returned by `StringeeClient` factory methods (`createConversation`, `getConversationById`, etc.). Provides instance methods to send / fetch / delete / pin / edit messages, manage participants, mark as read, send typing events, and end the conversation.

Notable fields: `id`, `name`, `isGroup`, `participants` (array of `User`), `lastMessage`, `unreadCount`, `pinMsgId`.

### Message

[`src/chat/Message.js`](../src/chat/Message.js)

Represents a single chat message. Notable fields: `localId`, `id`, `conversationId`, `sender`, `createdAt`, `state`, `sequence`, `type`, `content`. Provides instance methods such as `pinMessage`, `editMessage`, `revokeMessage`.

### User

[`src/chat/User.js`](../src/chat/User.js)

Profile information for a participant: `userId`, `name`, `avatar`, `role`, `email`, `phone`, plus device / browser metadata used by live-chat scenarios.

### ChatRequest

[`src/chat/ChatRequest.js`](../src/chat/ChatRequest.js)

A pending live-chat assignment delivered to an agent through `StringeeClientListener.onReceiveChatRequest` / `onReceiveTransferChatRequest`. Provides `acceptChatRequest()` and `rejectChatRequest()`.

---

## Video objects

### StringeeVideoTrack

[`src/video/StringeeVideoTrack.js`](../src/video/StringeeVideoTrack.js)

A media track produced by `StringeeCall2` (or the conference SDK). Fields: `localId`, `serverId`, `isLocal`, `audio`, `video`, `screen`, `trackType` ([`TrackType`](#enums)), and `publisher` ([`StringeeRoomUser`](#stringeeroomuser)). Pass it to `StringeeVideoView` via the `videoTrack` prop to render.

### StringeeRoomUser

[`src/video/StringeeRoomUser.js`](../src/video/StringeeRoomUser.js)

Lightweight user descriptor attached to a `StringeeVideoTrack`. Currently exposes `userId`.

---

## Helper / parameter objects

### StringeeServerAddress

[`src/helpers/StringeeServerAddress.js`](../src/helpers/StringeeServerAddress.js)

A `(host, port)` pair you can pass to `StringeeClient` when targeting a custom Stringee deployment.

### ConversationOption

[`src/helpers/ConversationOption.js`](../src/helpers/ConversationOption.js)

Options used when calling `StringeeClient.createConversation`: `name`, `isDistinct`, `isGroup`.

### ConversationInfo

[`src/helpers/ConversationInfo.js`](../src/helpers/ConversationInfo.js)

Update payload for `StringeeClient.updateConversation`: `name`, `avatar`.

### UserInfo

[`src/helpers/UserInfo.js`](../src/helpers/UserInfo.js)

Update payload for `StringeeClient.updateUserInfo` / `updateUserInfo2`. Includes `name`, `email`, `avatar`, `phone`, plus device / browser fields used by live chat.

### NewMessageInfo

[`src/helpers/NewMessageInfo.js`](../src/helpers/NewMessageInfo.js)

The shape `Conversation.sendMessage` expects: `convId`, `type`, plus a `message` object whose fields depend on `type` (text content, photo, video, audio, file, location, contact, sticker).

### LiveChatTicketParam

[`src/helpers/LiveChatTicketParam.js`](../src/helpers/LiveChatTicketParam.js)

Customer-side payload for `StringeeClient.createLiveChatTicket`: `name`, `email`, `phone`, `note`.

### StringeeError

[`src/helpers/StringeeError.js`](../src/helpers/StringeeError.js)

The error type rejected by every `Promise`-returning SDK method. Fields: `name` (the SDK function that produced the error), `code`, `message`. Convention:

- `code > 0` — error returned by the Stringee server.
- `code < 0` — error produced by the SDK locally.

---

## Enums

All enums live in [`src/helpers/StringeeHelper.js`](../src/helpers/StringeeHelper.js).

| Enum | Members | Used by |
|------|---------|---------|
| `SignalingState` | `calling`, `ringing`, `answered`, `busy`, `ended` | `onChangeSignalingState` |
| `MediaState` | `connected`, `disconnected` | `onChangeMediaState` |
| `MediaType` | `audio`, `video` | `onTrackMediaStateChange` |
| `AudioDevice` | `speakerPhone`, `wiredHeadset`, `earpiece`, `bluetooth`, `none` | `onAudioDeviceChange` (Android) |
| `VideoResolution` | `normal`, `hd` | `StringeeCall.videoResolution`, `StringeeCall2.videoResolution` |
| `CallType` | call type values used internally | `StringeeCall.callType` |
| `TrackType` | `screen`, `player`, `camera` | `StringeeVideoTrack.trackType` |
| `StringeeVideoScalingType` | `fit`, `fill` | `StringeeVideoView.scalingType` |
| `ObjectType` / `ChangeType` | values describing what changed and how | `onObjectChange` |
