# Migrate to stringee-react-native-v2

In `stringee-react-native-v2`, `StringeeClient`, `StringeeCall`, and
`StringeeCall2` are plain classes rather than React components. Some chat
operations also moved from `StringeeClient` to the model that owns them.

Follow this guide to migrate existing integrations. JavaScript and TypeScript
applications use the same package-root imports.
### Convert callBack functions to Promise functions
In `stringee-react-native-v2`, we convert all callBack functions to promise functions.
If the function fails, you will get the `StringeeError`, which contains an error message and error code.

E.g value return:
```js
// Old
stringeeClient.getConversationById('conversationId',(status, code, message, conversation) => {
    if (status){
        // getConversationById success and you receive the conversation.
    } else {
        // getConversationById fails and you receive an error message and error code.
    }
});
// New 
stringeeClient.getConversationById('conversationId')
    .then(conversation => {
        // getConversationById success and you receive the conversation.
    }).catch(error => {
        // getConversationById fails and you receive an error: StringeeError.
    });
```

E.g non value return:
```js
// Old
stringeeClient.unregisterPush('deviceToken',(status, code, message) => {
    if (status){
        // unregisterPush success.
    } else {
        // unregisterPush fails and you receive an error message and error code.
    }
});
// New 
stringeeClient.unregisterPush('conversationId')
    .then(() => {
        // unregisterPush success.
    }).catch(error => {
        // unregisterPush fails and you receive an error: StringeeError.
    });
```

#### StringeeClient

- Create new StringeeClient:

```js
stringeeClient = new StringeeClient();

// You can push your baseUrl, stringeeXBaseUrl, and list of serverAddress into parameters to create StringeeClient like this
stringeeClient = new StringeeClient({
   baseUrl : 'your base url',
   stringeeXBaseUrl: 'your stringeex base url',
   serverAddresses: [new StringeeServerAddress('host', port)],
});
```

- Listen for events from `StringeeClient` with `setListener` and `StringeeClientListener`:

```js
// Create new StringeeClientListener
stringeeClientListener = new StringeeClientListener();
// Declare which events you want to listen to like this
stringeeClientListener.onConnect = (stringeeClient, userId)=>{};
...
// Register to listen to StringeeClient events
stringeeClient.setListener(stringeeClientListener);
```

#### StringeeCall

- Create new StringeeCall:

```js
stringeeCall = new StringeeCall({
   stringeeClient: stringeeClient, /// stringeeClient using to connect
   from: 'caller_userId', /// caller id
   to: 'callee_userId', /// callee id
});
```

Listen for events from `StringeeCall` with `setListener` and `StringeeCallListener`:

```js
// Create new StringeeCallListener
stringeeCallListener = new StringeeCallListener();
// Declare which events you want to listen to like this
stringeeCallListener.onChangeSignalingState  = (stringeeCall, signalingState, reason, sipCode, sipReason) => {};
...
// Register to listen to StringeeCall events
stringeeCall.setListener(stringeeCallListener);
```

- function `makeCall` no longer need to put parameters to make a call:

```js
stringeeCall.makeCall()
    .then(() => {
        console.log('makeCall success');
    })
    .catch(error => {
        console.log('makeCall', error.code, error.message);
    });
```

#### StringeeCall2

- Create new StringeeCall2:

```js
stringeeCall2 = new StringeeCall2({
   stringeeClient: stringeeClient, /// stringeeClient using to connect
   from: 'caller_userId', /// caller id
   to: 'callee_userId', /// callee id
});
```

Listen for events from `StringeeCall2` with `setListener` and `StringeeCall2Listener`:

```js
// Create new StringeeCall2Listener
stringeeCall2Listener = new StringeeCall2Listener();
// Declare which events you want to listen to like this
stringeeCall2Listener.onChangeSignalingState  = (stringeeCall2, signalingState, reason, sipCode, sipReason) => {};
...
// Register to listen to StringeeCall2 events
stringeeCall2.setListener(stringeeCall2Listener);
```

- function `makeCall` no longer needs to put parameters to make a call:

```js
stringeeCall2.makeCall()
    .then(() => {
        console.log('makeCall success');
    })
    .catch(error => {
        console.log('makeCall', error.code, error.message);
    });
```
#### Chat

In `stringee-react-native-v2`, we have moved some of the chat functionality to other classes for easier use and put them where they need to be.
See more details from these reference documents:
- [StringeeClient](https://developer.stringee.com/docs/react-native-module/react-native-stringeeclient)
- [Conversation](https://developer.stringee.com/docs/react-native-module/react-native-conversation)
- [Message](https://developer.stringee.com/docs/react-native-module/react-native-message)
- [ChatRequest](https://developer.stringee.com/docs/react-native-module/react-native-chatrequest)
