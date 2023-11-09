# Migrate to stringee-react-native-v2

In `stringee-react-native-v2`, class `StringeeClient`, `StringeeCall`, and `StringeeCall2` will no longer extend from `Component` and we move some chat function from `StringeeClient` to other class.
Following this guide to migrate them from Component to the normal Class:

#### StringeeClient

- Create new StringeeClient:

```flow js
stringeeClient = new StringeeClient();

// You can push your baseUrl, stringeeXBaseUrl, and list of serverAddress into parameters to create StringeeClient like this
stringeeClient = new StringeeClient({
   baseUrl : 'your base url',
   stringeeXBaseUrl: 'your stringeex base url',
   serverAddresses: [new StringeeServerAddress('host', port)],
});
```

- Listen event from StringeeClient by using method `registerEvents` and `StringeeClientListener`:

```flow js
// Create new StringeeClientListener
stringeeClientListener = new StringeeClientListener();
// Declare which events you want to listen to like this
stringeeClientListener.onConnect = (stringeeClient, userId)=>{};
...
// Register to listen to StringeeClient events
stringeeClient.registerEvents(stringeeClientListener);
```

#### StringeeCall

- Create new StringeeCall:

```flow js
stringeeCall = new StringeeCall({
   stringeeClient: stringeeClient, /// stringeeClient using to connect
   from: 'caller_userId', /// caller id
   to: 'callee_userId', /// callee id
});
```

Listen event from StringeeCall by using method `registerEvents` and `StringeeCallListener`:

```flow js
// Create new StringeeCallListener
stringeeCallListener = new StringeeCallListener();
// Declare which events you want to listen to like this
stringeeCallListener.onChangeSignalingState  = (stringeeCall, signalingState, reason, sipCode, sipReason) => {};
...
// Register to listen to StringeeCall events
stringeeCall.registerEvents(stringeeCallListener);
```

- function `makeCall` no longer need to put parameters to make a call:

```flow js
stringeeCall.makeCall((status, code, message) => {});
```

#### StringeeCall2

- Create new StringeeCall2:

```flow js
stringeeCall2 = new StringeeCall2({
   stringeeClient: stringeeClient, /// stringeeClient using to connect
   from: 'caller_userId', /// caller id
   to: 'callee_userId', /// callee id
});
```

Listen event from StringeeCall2 by using method `registerEvents` and `StringeeCall2Listener`:

```flow js
// Create new StringeeCall2Listener
stringeeCall2Listener = new StringeeCall2Listener();
// Declare which events you want to listen to like this
stringeeCall2Listener.onChangeSignalingState  = (stringeeCall2, signalingState, reason, sipCode, sipReason) => {};
...
// Register to listen to StringeeCall2 events
stringeeCall2.registerEvents(stringeeCall2Listener);
```

- function `makeCall` no longer needs to put parameters to make a call:

```flow js
stringeeCall2.makeCall((status, code, message) => {});
```
#### Chat

In `stringee-react-native-v2`, we have moved some of the chat functionality to other classes for easier use and put them where they need to be.
See more details from these reference documents:
- [StringeeClient](https://developer.stringee.com/docs/react-native-module/react-native-stringeeclient)
- [Conversation](https://developer.stringee.com/docs/react-native-module/react-native-conversation)
- [Message](https://developer.stringee.com/docs/react-native-module/react-native-message)
- [ChatRequest](https://developer.stringee.com/docs/react-native-module/react-native-chatrequest)

