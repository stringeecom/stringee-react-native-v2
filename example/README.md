# Stringee React Native V2 local example

This is a local React Native `0.84` TypeScript consumer for the SDK in the
parent directory. The dependency is declared as:

```json
"stringee-react-native-v2": "file:.."
```

The screen covers:

- connect and disconnect with a Stringee access token;
- outgoing and incoming `StringeeCall` and `StringeeCall2`;
- audio/video calls, local/remote video, answer, reject, hang up, and camera switching;
- custom messages and client/call event logs.

## Install

From the repository root:

```bash
npm run example:install
```

For iOS, install Pods after the npm dependencies:

```bash
cd example/ios
bundle install
bundle exec pod install
cd ../..
```

If CocoaPods is already available globally, `pod install` can be used instead
of the two Bundler commands.

## Run

Start Metro from the repository root:

```bash
npm run example:start
```

In a second terminal, run one platform:

```bash
npm run example:android
# or
npm run example:ios
```

The run commands rebuild the parent SDK before launching. If native dependencies
or autolinking change, run `npm run example:install` and iOS `pod install` again.

## Credentials and permissions

Generate a short-lived access token on a trusted backend and paste it into the
app. Never commit a production token or Stringee secret. Android asks for camera
and microphone permissions before a call; iOS usage descriptions are already in
`Info.plist` and the OS prompts when media is first used.

Use two devices or simulators with tokens for different Stringee user IDs to test
app-to-app calls and custom messages. Camera behavior can be limited on simulators,
so video smoke tests should also be run on physical devices.

## Checks

```bash
npm run example:typecheck
npm --prefix example test -- --runInBand
cd example/android && ./gradlew assembleDebug
```
