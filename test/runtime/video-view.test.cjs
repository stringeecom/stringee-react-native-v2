const assert = require('node:assert/strict');
const test = require('node:test');
const {loadSdk} = require('./sdk-test-harness.cjs');

test('StringeeVideoView creates and reloads the Android native view', () => {
  const harness = loadSdk({platform: 'android', legacyViewManager: true});
  const {sdk} = harness;
  const view = new sdk.StringeeVideoView({
    local: true,
    scalingType: sdk.StringeeVideoScalingType.fit,
    style: [{width: 160}, {height: 120}],
    uuid: 'call-uuid',
  });

  view.componentDidMount();
  view.reload();

  assert.deepEqual(harness.dispatchedCommands[0], [101, '1', []]);
  assert.deepEqual(harness.dispatchedCommands[1], [101, '2', [{
    height: 120,
    local: true,
    scalingType: 'fit',
    uuid: 'call-uuid',
    videoTrack: undefined,
    width: 160,
  }]]);
  const rendered = view.render();
  assert.equal(rendered.type, 'View');
  assert.equal(rendered.children[0].type, 'RNStringeeVideoView');
});

test('StringeeVideoView guards null handles and reloads only when relevant props change', () => {
  const nullHarness = loadSdk({platform: 'android', findNodeHandleValue: null});
  const nullView = new nullHarness.sdk.StringeeVideoView({style: {width: 10, height: 10}});
  nullView.componentDidMount();
  nullView.reload();
  assert.equal(nullHarness.dispatchedCommands.length, 0);

  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const previousProps = {style: {width: 100, height: 100}, uuid: 'call'};
  const view = new sdk.StringeeVideoView(previousProps);
  view.componentDidMount();
  let reloads = 0;
  view.reload = () => {
    reloads += 1;
  };

  view.props = {...previousProps};
  view.componentDidUpdate(previousProps);
  assert.equal(reloads, 0);

  view.props = {...previousProps, local: true};
  view.componentDidUpdate(previousProps);
  assert.equal(reloads, 1);

  view.props = {
    ...previousProps,
    videoTrack: new sdk.StringeeVideoTrack({
      localId: 'local',
      serverId: 'server',
      isLocal: true,
      audio: true,
      video: true,
      screen: false,
      trackType: 0,
      publisher: {userId: 'publisher'},
    }),
  };
  view.componentDidUpdate(previousProps);
  assert.equal(reloads, 2);
});

test('StringeeVideoView dispatches numeric iOS reload commands with defaults', () => {
  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const view = new sdk.StringeeVideoView({style: {width: 200, height: 150}});
  view.componentDidMount();
  view.reload();

  assert.deepEqual(harness.dispatchedCommands, [[101, 2, [{
    height: 150,
    local: false,
    scalingType: 'fill',
    uuid: undefined,
    videoTrack: undefined,
    width: 200,
  }]]]);
});
