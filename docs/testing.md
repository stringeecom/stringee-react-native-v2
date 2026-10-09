# Testing

The repository validates the TypeScript façade, package contract, and both native
integrations separately.

## Main checks

| Command | Purpose |
|---|---|
| `npm run typecheck` | Strict TypeScript check of SDK source |
| `npm run test:types` | Strict compile of a TypeScript consumer fixture |
| `npm run test:runtime` | Runtime exports, models, bridge forwarding, listeners, and video view |
| `npm run test:coverage` | Runtime suite with 75% line, branch, and function gates |
| `npm run test:package` | Pack tarball, install it offline, then validate JS and TS consumers |
| `npm run test:android` | Android release AAR compile against current React Native |
| `npm run test:android:legacy` | Android release AAR compile against React Native 0.71 |
| `npm run test:ios` | CocoaPods integration and simulator framework build |
| `npm run test:podspec` | Podspec lint |
| `npm run example:typecheck` | Strict compile of the runnable RN 0.84 sample |

`npm test` runs coverage, the strict consumer fixture, and the packed-package
contract. `prepack` cleans generated output and runs this same suite before npm
creates a release tarball.

## Coverage contract

Node's test runner measures the transpiled files that are actually shipped under
`lib/commonjs`. The command fails if any global metric is below 75%:

```bash
npm run test:coverage
```

Native modules are represented by a deterministic bridge harness. Tests verify
Promise success/error mapping, native argument forwarding, platform-specific
branches, UUID event filtering, listener payload conversion, chat model mapping,
and view-manager commands. Native compilation remains a separate check because
JavaScript coverage cannot prove Java or Objective-C compatibility.

## Release verification

Before publishing, run:

```bash
npm test
npm pack --dry-run
npm run test:android
npm run test:ios
npm run test:podspec
```

Then smoke-test the local sample on physical Android and iOS devices using two
short-lived user tokens: connect/disconnect, token renewal with
`onTokenWillExpire`/`updateToken` and reconnect after expiry, incoming/outgoing Call and Call2,
audio/video rendering, answer/reject/hangup, and custom messages.
