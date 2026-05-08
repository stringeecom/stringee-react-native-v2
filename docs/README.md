# stringee-react-native-v2 — Documentation

This folder contains reference documentation for the Stringee React Native SDK.

## Contents

- [API Reference](./api-reference.md) — public classes, listeners, enums, and helper objects exposed by the SDK. Read this if you are integrating the SDK into a React Native app.
- [Architecture](./architecture.md) — internal architecture and data flow between JavaScript and native (Android / iOS). Read this if you are maintaining or extending the SDK itself.

## Quick links

- [Installation guide](../README.md#getting-started)
- [Migration guide](../MIGRATEGUIDE.md)
- [Changelog](../README.md#version)

## Module entry point

All public classes are re-exported from the package root, so applications import directly from `stringee-react-native-v2`:

```js
import {
  StringeeClient,
  StringeeCall,
  StringeeCall2,
  StringeeVideoView,
  StringeeClientListener,
  StringeeCallListener,
  StringeeCall2Listener,
  // enums
  SignalingState,
  MediaState,
  VideoResolution,
  // helpers
  StringeeServerAddress,
  ConversationOption,
} from 'stringee-react-native-v2';
```

The exhaustive export list is defined in [`index.js`](../index.js).
