/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () => {
  const {View} = jest.requireActual('react-native');
  return {
    SafeAreaProvider: View,
    SafeAreaView: View,
  };
});

jest.mock('stringee-react-native-v2', () => {
  class MockCall {
    from = '';
    to = '';
    uuid = 'mock-call';
    isVideoCall = false;
    setListener = jest.fn();
    unregisterEvents = jest.fn();
    clean = jest.fn();
    initAnswer = jest.fn(async () => undefined);
    answer = jest.fn(async () => undefined);
    reject = jest.fn(async () => undefined);
    hangup = jest.fn(async () => undefined);
    makeCall = jest.fn(async () => undefined);
    switchCamera = jest.fn(async () => undefined);
  }

  return {
    SignalingState: {ended: 'ended'},
    StringeeCall: MockCall,
    StringeeCall2: class extends MockCall {},
    StringeeCallListener: class {},
    StringeeCall2Listener: class {},
    StringeeClient: class {
      userId = '';
      setListener = jest.fn();
      unregisterEvents = jest.fn();
      connect = jest.fn();
      disconnect = jest.fn();
      sendCustomMessage = jest.fn(async () => undefined);
    },
    StringeeClientListener: class {},
    StringeeVideoScalingType: {fit: 'fit', fill: 'fill'},
    StringeeVideoTrack: class {},
    StringeeVideoView: 'StringeeVideoView',
  };
});

import App from '../App';

test('renders the local SDK sample', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const text = JSON.stringify(renderer?.toJSON());
  expect(text).toContain('Stringee React Native V2');

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});
