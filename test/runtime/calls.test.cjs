const assert = require('node:assert/strict');
const test = require('node:test');
const {loadSdk} = require('./sdk-test-harness.cjs');

function videoTrackPayload(trackType = 0) {
  return {
    localId: 'local-track',
    serverId: 'server-track',
    isLocal: trackType === 0,
    audio: true,
    video: true,
    screen: trackType === 1,
    trackType,
    publisher: {userId: 'publisher'},
  };
}

for (const definition of [
  {className: 'StringeeCall', moduleName: 'RNStringeeCall'},
  {className: 'StringeeCall2', moduleName: 'RNStringeeCall2'},
]) {
  test(`${definition.className} forwards call controls and errors`, async () => {
    const harness = loadSdk({platform: 'ios'});
    const {sdk} = harness;
    const client = new sdk.StringeeClient();
    const CallClass = sdk[definition.className];
    const call = new CallClass({stringeeClient: client, from: 'alice', to: 'bob'});

    assert.equal(harness.callsFor(definition.moduleName, 'createWrapper').length, 1);
    await assert.rejects(call.answer(), error => error.code === -9);

    harness.succeed(definition.moduleName, 'makeCall', 'call-id', 'custom-data');
    call.isVideoCall = true;
    call.customData = 'custom';
    await call.makeCall();
    assert.equal(call.callId, 'call-id');

    call.canAnswer = true;
    await call.initAnswer();
    await call.answer();
    await call.hangup();
    await call.reject();
    await call.sendDTMF('5');
    if (definition.className === 'StringeeCall') {
      await call.sendCallInfo('{"hello":true}');
    }
    harness.succeed(definition.moduleName, 'getCallStats', '{"rtt":10}');
    assert.equal(await call.getCallStats(), '{"rtt":10}');
    await call.switchCamera();
    await call.enableVideo(false);
    await call.mute(true);
    await call.setSpeakerphoneOn(true);

    if (definition.className === 'StringeeCall2') {
      await assert.rejects(call.resumeVideo(), error => error.code === -10);
      await call.sendCallInfo('{"call2":true}');
      await call.setAutoSendTrackMediaStateChangeEvent(true);
    } else {
      const result = await call.resumeVideo();
      assert.equal(result.code, -10);
    }

    harness.handle(definition.moduleName, 'generateUUID', (...args) => {
      args.at(-1)('generated-uuid');
    });
    call.serial = 2;
    assert.equal(await call.generateUUID(), 'generated-uuid');

    harness.fail(definition.moduleName, 'enableVideo', 401, 'denied');
    await assert.rejects(
      call.enableVideo(true),
      error => error.name === 'enableVideo' && error.code === 401,
    );
    call.clean();
    assert.equal(harness.callsFor(definition.moduleName, 'clean').length, 1);
  });
}

test('StringeeCall routes every listener event and ignores other uuids', () => {
  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const call = new sdk.StringeeCall({stringeeClient: client, from: 'a', to: 'b'});
  const listener = new sdk.StringeeCallListener();
  const received = [];
  listener.onChangeSignalingState = (_call, state) => received.push(state);
  listener.onChangeMediaState = (_call, state) => received.push(state);
  listener.onReceiveLocalStream = () => received.push('local');
  listener.onReceiveRemoteStream = () => received.push('remote');
  listener.onReceiveDtmfDigit = (_call, digit) => received.push(digit);
  listener.onReceiveCallInfo = (_call, info) => received.push(info);
  listener.onHandleOnAnotherDevice = (_call, state) => received.push(state);
  call.setListener(listener);

  harness.emit('didChangeSignalingState', {uuid: 'other', data: {code: 0}});
  harness.emit('didChangeSignalingState', {uuid: call.uuid, data: {code: 2, reason: 'ok', sipCode: 200, sipReason: 'OK', callId: 'event-call-id'}});
  harness.emit('didChangeMediaState', {uuid: call.uuid, data: {code: 0, description: 'ready'}});
  harness.emit('didReceiveLocalStream', {uuid: call.uuid, data: {}});
  harness.emit('didReceiveRemoteStream', {uuid: call.uuid, data: {}});
  harness.emit('didReceiveDtmfDigit', {uuid: call.uuid, data: {dtmf: '#'}});
  harness.emit('didReceiveCallInfo', {uuid: call.uuid, data: {data: 'info'}});
  harness.emit('didHandleOnAnotherDevice', {uuid: call.uuid, data: {code: 4, description: 'handled'}});

  assert.deepEqual(received, ['answered', 'connected', 'local', 'remote', '#', 'info', 'ended']);
  assert.equal(call.callId, 'event-call-id');
  call.setListener(null);
  call.unregisterEvents();
});

test('StringeeCall2 routes tracks, media state and audio devices on Android', async () => {
  const harness = loadSdk({platform: 'android'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const call = new sdk.StringeeCall2({stringeeClient: client, from: 'a', to: 'b'});
  const listener = new sdk.StringeeCall2Listener();
  const received = [];
  listener.onChangeSignalingState = (_call, state) => received.push(state);
  listener.onChangeMediaState = (_call, state) => received.push(state);
  listener.onReceiveLocalTrack = (_call, track) => received.push(track.trackType);
  listener.onReceiveRemoteTrack = (_call, track) => received.push(track.trackType);
  listener.onReceiveDtmfDigit = (_call, digit) => received.push(digit);
  listener.onReceiveCallInfo = (_call, info) => received.push(info);
  listener.onHandleOnAnotherDevice = (_call, state) => received.push(state);
  listener.onAudioDeviceChange = (_call, selected, available) => received.push(selected, ...available);
  listener.onTrackMediaStateChange = (_call, from, mediaType, enabled) => received.push(from, mediaType, enabled);
  call.setListener(listener);

  const emit = (eventName, data) => harness.emit(eventName, {uuid: call.uuid, data});
  emit('onSignalingStateChange', {code: 0, reason: 'calling', sipCode: 0, sipReason: ''});
  emit('onMediaStateChange', {code: 1, description: 'offline'});
  emit('onLocalTrackAdded', {videoTrack: videoTrackPayload(0)});
  emit('onRemoteTrackAdded', {videoTrack: videoTrackPayload(1)});
  emit('onDTMF', {dtmf: '7'});
  emit('onCallInfo', {data: 'payload'});
  emit('onHandledOnAnotherDevice', {code: 3, description: 'busy'});
  emit('onAudioDeviceChange', {selectedAudioDevice: 'BLUETOOTH', availableAudioDevices: ['SPEAKER_PHONE', 'WIRED_HEADSET', 'EARPIECE', 'NONE']});
  emit('onTrackMediaStateChange', {from: 'bob', mediaType: 2, enable: false});

  assert.deepEqual(received, [
    'calling', 'disconnected', 'camera', 'screen', '7', 'payload', 'busy',
    'bluetooth', 'speakerPhone', 'wiredHeadset', 'earpiece', 'none',
    'bob', 'video', false,
  ]);

  await call.resumeVideo();
  await assert.rejects(call.generateUUID(), error => error.code === -10);
  call.unregisterEvents();
});
