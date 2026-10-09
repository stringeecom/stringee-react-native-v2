# React Native Integration

This guide describes the supported application contract for both JavaScript and
TypeScript React Native projects. The runnable reference is the
[`example`](../example/README.md) app.

## Compatibility

| Layer | Supported contract |
|---|---|
| React Native | `>=0.60`; New Architecture is supported through bridge interop |
| JavaScript | CommonJS is precompiled; applications do not need TypeScript |
| TypeScript | Strict declarations are published from the package root |
| Android | Stringee `2.1.18`, WebRTC `150.7871.01`, AndroidX enabled |
| iOS | Stringee `2.2.0`, WebRTC `137.0.0`, deployment target iOS 15 or later |

TurboModule and Fabric code generation are not implemented by this release. On
New Architecture applications the existing native module and view manager run
through React Native's interoperability layer.

## Install and link

Stringee iOS SDK `2.2.0` is not on the CocoaPods trunk, so the iOS `Podfile`
must target iOS 15 and point CocoaPods at its podspec inside the app target:

```ruby
platform :ios, '15.0'

target 'YourApp' do
  # ...
  pod 'Stringee', :podspec => 'https://raw.githubusercontent.com/stringeecom/Stringee-iOS-SDK/2.2.0/Stringee.podspec'
end
```

```bash
npm install stringee-react-native-v2
cd ios && pod install --repo-update && cd ..
```

React Native autolinking discovers the Android package and iOS podspec. Apart
from the `Stringee` podspec line above, do not manually add another Stringee or
WebRTC dependency because duplicate versions can cause native symbol or class
conflicts.

## Expo integration

This package works with Expo development and production builds through React
Native autolinking. It cannot run in Expo Go because it contains custom native
modules and a native view manager.

Expo Go is a precompiled native application and cannot load an arbitrary native
library after installation. A custom Expo development build removes that
limitation by compiling this package into the application binary. Consequently,
`expo start` alone is not sufficient after the first install or after a native
SDK upgrade.

The SDK uses the regular React Native integration contract. Expo autolinking
detects `RNStringeeReactPackage` for Android and `RNStringee.podspec` for iOS, so
the consumer must not add `expo-module.config.json`, edit `MainApplication`, or
add `pod 'RNStringee'` manually. The package does not need to be converted to the
Expo Modules API.

| Expo runtime | Result |
|---|---|
| Expo Go or Snack running in Expo Go | Unsupported: native module is absent |
| `expo run:android` / `expo run:ios` development build | Supported |
| EAS development, preview, or production build | Supported |
| OTA update after a compatible native build exists | Supported for JS changes only |

Version `1.1.2` does not ship a config plugin because one is not required for
linking. In a CNG project, add the Stringee iOS SDK `2.2.0` podspec through
`expo-build-properties` (`ios.deploymentTarget: "15.0"` and an `ios.extraPods`
entry with `name: "Stringee"` and the `podspec` URL above). In a CNG project, the host app must still declare native permissions and
iOS usage descriptions in app config so they survive prebuild:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera for video calls.",
        "NSMicrophoneUsageDescription": "This app uses the microphone for calls."
      }
    },
    "android": {
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_WIFI_STATE",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.CAMERA",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_CONNECT"
      ]
    }
  }
}
```

App config adds the build-time declarations but does not grant dangerous
permissions. Before starting the relevant feature on Android, request camera,
microphone, and `BLUETOOTH_CONNECT` at runtime with `PermissionsAndroid`.

Build a custom development client:

```bash
npx expo install expo-dev-client
npx expo prebuild --clean
npx expo run:android
# or
npx expo run:ios
```

EAS Build performs prebuild when native directories are absent. Rebuild the
development client whenever this SDK is installed or upgraded; restarting the
JavaScript bundler alone cannot update native binaries.

The integration was validated with a clean Expo SDK 57 / React Native 0.86 New
Architecture fixture. Expo's React Native config detected
`new RNStringeeReactPackage()` on Android and `RNStringee.podspec` on iOS;
Android `assembleDebug`, iOS `pod install`, and the `RNStringee` simulator pod
build all completed successfully. The fixture also type-checked and Metro
bundled a screen that imports `StringeeClient` and renders `StringeeVideoView`.

`expo prebuild --clean` replaces generated native files. Stringee's R8 rules are
included; a local plugin is only required for
optional manifest metadata that app config cannot express, such as
`<uses-feature>` entries and `android:maxSdkVersion="30"` on the legacy Bluetooth
permission.

References: Expo
[development builds](https://docs.expo.dev/develop/development-builds/introduction/),
[app permissions](https://docs.expo.dev/guides/permissions/), and
[config plugins](https://docs.expo.dev/config-plugins/plugins/). See also the
[`expo-build-properties` reference](https://docs.expo.dev/versions/latest/sdk/build-properties/)
for `android.extraProguardRules`.

## Import contract for JavaScript and TypeScript

Both languages import from the package root:

```ts
import {
  StringeeCall,
  StringeeClient,
  StringeeClientListener,
} from 'stringee-react-native-v2';
```

Do not import from `src` or `lib/commonjs`; those paths are implementation details.
Listener callbacks are optional, so a consumer can construct an empty listener
and assign only the callbacks it needs.

JavaScript applications consume the compiled CommonJS output and do not need
TypeScript installed. They may also use `require`:

```js
const {
  StringeeCall,
  StringeeClient,
} = require('stringee-react-native-v2');
```

TypeScript applications automatically resolve the declarations published by
the package. A standard React Native or Expo `tsconfig.json` is sufficient; do
not enable `skipLibCheck` just for this SDK. Import public interfaces with
`import type` when the compiler option `verbatimModuleSyntax` is enabled:

```ts
import {StringeeClient} from 'stringee-react-native-v2';
import type {StringeeClientOptions} from 'stringee-react-native-v2';

const options: StringeeClientOptions = {};
const client = new StringeeClient(options);
```

The native installation, permissions, and development-build requirements do not
change based on whether application code is JavaScript or TypeScript. After an
upgrade, if Metro serves stale package output, reinstall dependencies and clear
its cache with `npx expo start --clear` or
`npx react-native start --reset-cache`.

## Client lifecycle

Create the client once for the signed-in user, attach the listener before
connecting, and unregister on cleanup:

```ts
const client = new StringeeClient();
const listener = new StringeeClientListener();

listener.onConnect = (_client, userId) => console.log('Connected', userId);
listener.onTokenWillExpire = () => renewToken(); // calls client.updateToken(newToken)
listener.onRequestAccessToken = () => refreshTokenAndReconnect();
listener.onIncomingCall = (_client, call) => handleIncomingCall(call);

client.setListener(listener);
client.connect(accessToken);

// On sign-out/unmount:
client.unregisterEvents();
client.disconnect();
```

Generate access tokens on a trusted server. Never embed a Stringee secret or a
long-lived production token in application source.

About 60 seconds before the token expires, `onTokenWillExpire(client, exp,
expireInSeconds)` is invoked; pass a new token for the same user to
`client.updateToken(token)` to keep the connection. Without renewal the server
closes the connection at expiry, `onFailWithError` and `onRequestAccessToken`
are invoked, and the app must call `connect(newToken)` on the same client. On
iOS, an app that does not assign `onTokenWillExpire` receives
`onRequestAccessToken` before expiry instead, as in previous versions.

## Calls and video

Construct outgoing calls with all three required options. Set media options and
the listener before `makeCall()`:

```ts
const call = new StringeeCall({stringeeClient: client, from, to});
call.isVideoCall = true;
call.setListener(callListener);
await call.makeCall();
```

For an incoming call, attach its listener and initialize the answer before
answering:

```ts
incomingCall.setListener(callListener);
await incomingCall.initAnswer();
await incomingCall.answer();
```

`StringeeCall` renders by call UUID and local/remote flag. `StringeeCall2`
renders the `StringeeVideoTrack` emitted by its listener:

```tsx
<StringeeVideoView uuid={call.uuid} local style={{width: 120, height: 160}} />
<StringeeVideoView videoTrack={remoteTrack} style={{width: '100%', height: 300}} />
```

Call `unregisterEvents()` and `clean()` when a call ends to release subscriptions
and its native wrapper.

## Native permissions

Android applications need internet/network, audio, camera, and audio-settings
permissions. Request dangerous camera and microphone permissions at runtime.
Bluetooth permissions are needed when routing audio through Bluetooth on relevant
Android versions. The complete manifest is in
[`example/android/app/src/main/AndroidManifest.xml`](../example/android/app/src/main/AndroidManifest.xml).

iOS applications must include `NSCameraUsageDescription` and
`NSMicrophoneUsageDescription`. See
[`example/ios/StringeeExample/Info.plist`](../example/ios/StringeeExample/Info.plist).

## Local development

The sample links the parent repository with `file:..`; its Metro config watches
the SDK root and forces React/React Native resolution to the app's copies. This
prevents duplicate React instances while testing changes before publishing.

```bash
npm run example:install
npm run example:start
npm run example:android  # or example:ios
```

The start and run scripts rebuild the TypeScript SDK before launching Metro or a
native app.
