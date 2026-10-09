# Changelog

This file lists SDK API changes and observable feature behavior. Documentation,
tests, build tooling, and internal-only refactors are omitted.

## [1.1.2]

### Added

- Notification shortly before the access token expires.
- Access token renewal on the open connection, without reconnecting.

### Changed

- Updated Stringee Android SDK to 2.1.18.
- Updated Stringee iOS SDK to 2.2.0; iOS 15 or later is required.
- iOS apps must add the Stringee 2.2.0 podspec to their Podfile.
- The connection closes when the access token expires without renewal.

### Fixed

- Incoming calls missed or shown twice on poor networks.
- Native crash on Android when a video call ended before connecting.
- Memory leak on Android from listeners of completed requests.
- Calls with a bandwidth limit not connecting on Android.
- Hold and unhold ignored with a bandwidth limit on Android.

## [1.1.1]

- Upgrade Stringee Android SDK to `2.1.15`, WebRTC to `150.7871.01`, and consumer rules.

## [1.1.0]

- Upgrade Stringee Android SDK to `2.1.13` and WebRTC to `144.7559.09`.
- Migrate the JavaScript layer to TypeScript and add type declarations for TypeScript consumers.
- Keep existing package-root imports and runtime APIs compatible with JavaScript projects.
- Improve `StringeeVideoView` compatibility with current React Native versions.

## [1.0.11]

- Fix an Android crash when answering an incoming call.

## [1.0.10]

- Upgrade Stringee Android SDK to `2.1.10`.

## [1.0.9]

- Fix an eKYC image capture crash on some iOS devices.
- Fix an audio startup crash on Android tablets.

## [1.0.8]

- Fix a video-call crash on some iOS devices.

## [1.0.7]

- Upgrade the iOS WebRTC dependency.

## [1.0.6]

- Fix Android video rendering.

## [1.0.5]

- Upgrade the Android WebRTC dependency.

## [1.0.4]

- Improve captured-photo quality on some iOS devices.

## [1.0.3]

- Fix Android `StringeeVideoView` behavior.

## [1.0.2]

- Upgrade the Stringee iOS SDK.

## [1.0.1]

- Upgrade the Stringee Android SDK.

## [1.0.0]

- Initial release.
