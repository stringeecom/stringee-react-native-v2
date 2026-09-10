# Stringee React Native SDK documentation

## Integration guides

- [React Native integration](./react-native-integration.md) — installation,
  native permissions, client lifecycle, calls, video rendering, JavaScript and
  TypeScript compatibility, and New Architecture interoperability.
- [API reference](./api-reference.md) — public classes, listeners, models,
  helper objects, enum values, constructor options, and return types.
- [Migration guide](../MIGRATEGUIDE.md) — migrate callback-based integrations
  to the Promise-based V2 API.
- [Local example](../example/README.md) — run the SDK locally on Android or iOS.

## Maintainer documentation

- [Architecture](./architecture.md) — TypeScript/native bridge structure and
  event routing.
- [Testing](./testing.md) — package, type, runtime, Android, and iOS validation.
- [Changelog](../CHANGELOG.md) — concise user-facing release history.

## Package imports

All public APIs are exported from `stringee-react-native-v2`:

```ts
import {
  MediaState,
  SignalingState,
  StringeeCall,
  StringeeCall2,
  StringeeCall2Listener,
  StringeeCallListener,
  StringeeClient,
  StringeeClientListener,
  StringeeVideoView,
  VideoResolution,
} from 'stringee-react-native-v2';
```

Do not import application APIs from `src` or `lib/commonjs`. Those directories
are implementation and build-output details rather than stable subpath exports.
