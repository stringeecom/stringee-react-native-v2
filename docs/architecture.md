# Architecture

This document describes how `stringee-react-native-v2` is organised across its JavaScript and native layers, and how a request flows from JS through the bridge into the underlying Stringee SDK and back. It is intended for SDK maintainers — application developers do not need to read it.

## High-level layers

```
┌─────────────────────────────────────────────────────────────┐
│  Application code (React Native, JS / TS)                   │
└─────────────────────────────────────────────────────────────┘
                          │  imports
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Public JS API  (src/*.js)                                  │
│  StringeeClient · StringeeCall · StringeeCall2 ·            │
│  StringeeVideoView · listeners · helpers · enums            │
└─────────────────────────────────────────────────────────────┘
                          │  NativeModules / NativeEventEmitter
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  React Native bridge modules                                │
│  Android: RNStringeeClientModule / RNStringeeCallModule /   │
│           RNStringeeCall2Module / RNStringeeVideoView*      │
│  iOS:     equivalent ObjC modules                           │
└─────────────────────────────────────────────────────────────┘
                          │  delegate to wrappers via uuid
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Wrappers (per-instance state holders)                      │
│  StringeeClientWrapper · StringeeCallWrapper ·              │
│  StringeeCall2Wrapper                                       │
└─────────────────────────────────────────────────────────────┘
                          │  forward to SDK
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Stringee native SDK  (com.stringee.sdk.android, iOS pod)   │
└─────────────────────────────────────────────────────────────┘
```

The same shape exists on iOS — only the file names and language differ.

## JavaScript layer

The JS layer is a thin façade over the bridge. It is responsible for:

1. **Generating a `uuid`** when a JS object is constructed (see `StringeeClient.js`, `StringeeCall.js`, `StringeeCall2.js`). The uuid is the handle that ties a JS instance to its native counterpart.
2. **Creating the native wrapper** by invoking `RNStringeeXxx.createWrapper(uuid, ...)` immediately in the constructor. This pre-registers the wrapper inside the native `StringeeManager` map so that subsequent method calls can find it.
3. **Forwarding method calls** to the native module, always passing `this.uuid` as the first argument.
4. **Bridging events back** to the user's listener via `NativeEventEmitter` subscriptions, filtered by `uuid` so that one global event stream can serve many concurrent instances.
5. **Wrapping callbacks** into Promises with `normalCallbackHandle(resolve, reject, fnName)` — the helper rejects with a `StringeeError` whenever the native side returns `(false, code, message)`.

### Event routing

`src/helpers/StringeeHelper.js` holds two important maps:

- `clientEvents`, `callEvents` — per-platform names of the events emitted by the native side (e.g. `didChangeSignalingState` on iOS, `onSignalingStateChange` on Android).
- `stringeeClientEvents`, `stringeeCallEvents`, `stringeeCall2Events` — the canonical JS-side names exposed on the listener interfaces.

When a user calls `setListener(...)`, the JS class iterates the canonical list, looks up the platform-specific native name, subscribes via `NativeEventEmitter`, and dispatches the event into the matching listener method only when the event payload's `uuid` matches the instance's `uuid`. This keeps event delivery instance-scoped.

### Public surface

[`index.js`](../index.js) re-exports every class, listener, helper, and enum the SDK exposes. The package's `main` field in [`package.json`](../package.json) points to this file. Any new addition that should be visible to applications must be exported here.

## Native layer (Android)

All Android sources live under [`android/src/main/java/com/stringeereactnative/`](../android/src/main/java/com/stringeereactnative). Logical grouping:

| Package | Responsibility |
|---------|---------------|
| `module/` | React Native bridge modules — `@ReactMethod` entry points called by JS |
| `wrapper/` | Per-instance state objects that hold a real Stringee SDK object plus its listener |
| `view/` | `RNStringeeVideoView` and its `ViewManager` — the native side of `StringeeVideoView` |
| `common/` | `Constant` (event / key strings), `Utils` (event emit, parsing, audio manager), `StringeeManager` (singleton holding the wrapper maps), `AudioManager` |
| `RNStringeeReactPackage` | Registers all modules and view managers with React Native |

### Modules

There is one module per JS class that needs a bridge:

- [`RNStringeeClientModule`](../android/src/main/java/com/stringeereactnative/module/RNStringeeClientModule.java) — backs `StringeeClient`.
- [`RNStringeeCallModule`](../android/src/main/java/com/stringeereactnative/module/RNStringeeCallModule.java) — backs `StringeeCall`.
- [`RNStringeeCall2Module`](../android/src/main/java/com/stringeereactnative/module/RNStringeeCall2Module.java) — backs `StringeeCall2`.

Each module is stateless; its methods take a `uuid`, look the wrapper up in `StringeeManager.getInstance().getXxxMap()`, and delegate. Example shape from `RNStringeeCallModule`:

```java
@ReactMethod
public void answer(String uuid, Callback callback) {
    StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
    if (callWrapper == null) {
        callback.invoke(false, -1, Constant.MESSAGE_STRINGEE_CALL_NOT_INITIALIZED, "");
        return;
    }
    callWrapper.answer(callback);
}
```

### Wrappers

A wrapper owns one Stringee SDK object and implements its listener interface. They hold per-instance state and translate between the SDK's listener callbacks and React Native events:

- [`StringeeClientWrapper`](../android/src/main/java/com/stringeereactnative/wrapper/StringeeClientWrapper.java) — wraps `com.stringee.StringeeClient`. Largest of the three; covers connection, push, custom messaging, conversations, messages, live chat.
- [`StringeeCallWrapper`](../android/src/main/java/com/stringeereactnative/wrapper/call/StringeeCallWrapper.java) — wraps `com.stringee.call.StringeeCall`.
- [`StringeeCall2Wrapper`](../android/src/main/java/com/stringeereactnative/wrapper/call/StringeeCall2Wrapper.java) — wraps `com.stringee.call.StringeeCall2`.

Two patterns to be aware of when editing wrappers:

1. **Per-method `Callback`** — most operations accept the JS callback as a parameter and use a local `StatusListener` whose `onSuccess` / `onError` invoke the callback in scope. Safe and self-contained.
2. **Field-stored `makeCallCallback`** — `makeCall` saves the JS callback into the field `makeCallCallback` so that the asynchronous `StringeeCallListener.onSignalingStateChange(CALLING)` / `onError` can complete it. Only the call wrappers use this pattern; it must always be guarded with a null check before invoking, and cleared after invoking, because:
   - For incoming calls (`answer` flow) the field is never set.
   - The RN bridge throws `IllegalStateException` if the same `Callback` is invoked twice.

### Manager and view

- [`StringeeManager`](../android/src/main/java/com/stringeereactnative/common/StringeeManager.java) is a singleton holding three maps keyed by uuid: `clientMap`, `callMap`, `call2Map`. The JS constructor's `createWrapper` call ensures an entry exists; cleanup is performed by JS-side `clean(uuid)` methods.
- [`RNStringeeVideoView`](../android/src/main/java/com/stringeereactnative/view/RNStringeeVideoView.java) and [`RNStringeeVideoViewManager`](../android/src/main/java/com/stringeereactnative/view/RNStringeeVideoViewManager.java) implement the native view backing `StringeeVideoView`. They look up the wrapper from `StringeeManager` (via the `uuid` prop) and attach a `TextureViewRenderer` to display either the local stream / track or a remote one, honouring `scalingType`.

### Utilities

- [`Constant`](../android/src/main/java/com/stringeereactnative/common/Constant.java) — every event name, JSON key, and error message string lives here. New events go here first.
- [`Utils`](../android/src/main/java/com/stringeereactnative/common/Utils.java) — `sendEvent(reactContext, name, data)` is the single entry point for emitting events to JS. Also hosts audio-manager helpers and JSON parsing for messages and conversations.

## End-to-end flow

This walks through what happens when an application makes an outgoing call. The same shape applies to all other flows.

### Outgoing call (`StringeeCall.makeCall`)

1. **JS construction**
   - App: `const call = new StringeeCall({stringeeClient, from, to})`.
   - `StringeeCall` constructor generates `this.uuid` and calls `RNStringeeCall.createWrapper(uuid, stringeeClient.uuid)`.
   - On Android, the bridge invokes `RNStringeeCallModule.createWrapper`, which inserts a fresh `StringeeCallWrapper` (linked to the `StringeeClientWrapper`) into `StringeeManager.callMap`.

2. **Listener attachment**
   - App: `call.setListener(listener)`.
   - JS subscribes to platform-specific events (e.g. `onSignalingStateChange`) on `NativeEventEmitter`, filtering by `uuid`.

3. **Make call**
   - App: `await call.makeCall()`.
   - JS calls `RNStringeeCall.makeCall(uuid, params, callback)`.
   - `RNStringeeCallModule.makeCall` looks up the wrapper and forwards to `StringeeCallWrapper.makeCall(...)`.
   - Wrapper stores the JS callback in `makeCallCallback`, instantiates a real `StringeeCall`, sets itself as the SDK listener, configures audio manager, and invokes `stringeeCall.makeCall(StatusListener)`.

4. **Server acknowledges**
   - SDK fires `StringeeCallListener.onSignalingStateChange(stringeeCall, CALLING, ...)` on the wrapper.
   - Wrapper invokes `makeCallCallback(true, 0, "Success", callId, customData)` and clears the field.
   - The Promise on the JS side resolves; `onChangeSignalingState` is also dispatched to the application listener.

5. **State updates**
   - Subsequent state changes (`RINGING`, `ANSWERED`, `ENDED`) are emitted as events through `Utils.sendEvent` and routed by JS to the listener.

6. **Failure path**
   - If the SDK invokes `onError(code, desc)` instead, the wrapper invokes `makeCallCallback(false, code, desc, ...)` and clears it.
   - The JS Promise rejects with a `StringeeError`.

### Incoming call

1. SDK delivers an incoming `StringeeCall` to `StringeeClientWrapper`'s client listener.
2. Wrapper allocates a new uuid, creates a `StringeeCallWrapper` for it, registers in `StringeeManager.callMap`, sets the wrapper as the call's listener, and emits an `onIncomingCall` event whose payload includes the uuid plus call metadata.
3. JS receives the event, constructs a `StringeeCall` instance from the payload (passing the existing uuid so no new wrapper is created), and invokes `StringeeClientListener.onIncomingCall(client, call)`.
4. The application calls `initAnswer` / `answer` / `reject` as it would for an outgoing call. Note that `makeCallCallback` is never set on the incoming path — fields used by the listener must always be null-guarded.

## Adding a new SDK method

When exposing a new native capability:

1. Decide which JS class owns it (`StringeeClient`, `StringeeCall`, `StringeeCall2`, etc.).
2. Add a JSDoc-annotated method on the JS class that calls the corresponding `RNStringeeXxx.<method>(uuid, ...args, normalCallbackHandle(resolve, reject, '<method>'))`.
3. Add a `@ReactMethod` to the matching Android module that resolves the wrapper from `StringeeManager` and delegates.
4. Implement the operation on the wrapper, using the per-method `Callback` pattern (no field-stored callbacks unless absolutely necessary).
5. Add an iOS counterpart with the same method name. The JS layer is platform-agnostic.
6. If the operation produces async events (not just a single-shot result), define an event name in `Constant.java`, add it to `callEvents` / `clientEvents` in `StringeeHelper.js` for both platforms, and surface it on the matching listener interface.
7. Re-export anything new from [`index.js`](../index.js).

## Adding a new event

1. Define the JS-side canonical name (e.g. `onSomethingHappened`) and add it to the appropriate `stringeeXxxEvents` array in [`StringeeHelper.js`](../src/helpers/StringeeHelper.js).
2. Map it to the platform-specific native event names under `clientEvents` / `callEvents`.
3. On Android, declare the event string in [`Constant.java`](../android/src/main/java/com/stringeereactnative/common/Constant.java) and emit it from the wrapper using `Utils.sendEvent(reactContext, eventName, data)`. Always include `uuid` in the payload.
4. Add a typed callback property on the matching `*Listener` JS class so applications get IDE autocompletion.
