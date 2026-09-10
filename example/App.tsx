import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  SignalingState,
  StringeeCall,
  StringeeCall2,
  StringeeCall2Listener,
  StringeeCallListener,
  StringeeClient,
  StringeeClientListener,
  StringeeVideoScalingType,
  StringeeVideoTrack,
  StringeeVideoView,
} from 'stringee-react-native-v2';

type CallMode = 'call' | 'call2';
type ActiveCall = StringeeCall | StringeeCall2;

const MAX_LOG_LINES = 60;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function requestCallPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.CAMERA,
  ]);

  return Object.values(permissions).every(
    result => result === PermissionsAndroid.RESULTS.GRANTED,
  );
}

function App(): React.JSX.Element {
  const clientRef = useRef<StringeeClient | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);
  const [token, setToken] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [customMessage, setCustomMessage] = useState('Hello from Stringee');
  const [callMode, setCallMode] = useState<CallMode>('call2');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [activeCallMode, setActiveCallMode] = useState<CallMode>('call2');
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [localTrack, setLocalTrack] = useState<StringeeVideoTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<StringeeVideoTrack | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const appendLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(current =>
      [`${timestamp}  ${message}`, ...current].slice(0, MAX_LOG_LINES),
    );
  }, []);

  const resetVideo = useCallback(() => {
    setLocalStreamReady(false);
    setRemoteStreamReady(false);
    setLocalTrack(null);
    setRemoteTrack(null);
  }, []);

  const releaseCall = useCallback(
    (call: ActiveCall) => {
      call.unregisterEvents();
      call.clean();
      if (activeCallRef.current === call) {
        activeCallRef.current = null;
        setActiveCall(null);
        resetVideo();
      }
    },
    [resetVideo],
  );

  const bindCall = useCallback(
    (call: ActiveCall, mode: CallMode, incoming: boolean) => {
      const previousCall = activeCallRef.current;
      if (previousCall && previousCall !== call) {
        previousCall.unregisterEvents();
        previousCall.clean();
      }

      resetVideo();
      activeCallRef.current = call;
      setActiveCall(call);
      setActiveCallMode(mode);
      setStatus(incoming ? `Incoming ${mode}` : `Starting ${mode}`);

      const onSignalingState = (
        eventCall: ActiveCall,
        signalingState: SignalingState,
        reason: string,
      ) => {
        setStatus(`${signalingState}${reason ? `: ${reason}` : ''}`);
        appendLog(`${mode} signaling: ${signalingState} (${reason || '-'})`);
        if (signalingState === SignalingState.ended) {
          releaseCall(eventCall);
        }
      };

      if (mode === 'call2' && call instanceof StringeeCall2) {
        const listener = new StringeeCall2Listener();
        listener.onChangeSignalingState = (eventCall, state, reason) =>
          onSignalingState(eventCall, state, reason);
        listener.onChangeMediaState = (_eventCall, state, description) => {
          appendLog(`Call2 media: ${state} (${description || '-'})`);
        };
        listener.onReceiveLocalTrack = (_eventCall, track) => {
          setLocalTrack(track);
          appendLog('Call2 local video track received');
        };
        listener.onReceiveRemoteTrack = (_eventCall, track) => {
          setRemoteTrack(track);
          appendLog('Call2 remote video track received');
        };
        listener.onReceiveDtmfDigit = (_eventCall, digit) =>
          appendLog(`Call2 DTMF received: ${digit}`);
        call.setListener(listener);
      } else if (call instanceof StringeeCall) {
        const listener = new StringeeCallListener();
        listener.onChangeSignalingState = (eventCall, state, reason) =>
          onSignalingState(eventCall, state, reason);
        listener.onChangeMediaState = (_eventCall, state, description) => {
          appendLog(`Call media: ${state} (${description || '-'})`);
        };
        listener.onReceiveLocalStream = () => {
          setLocalStreamReady(true);
          appendLog('Call local stream received');
        };
        listener.onReceiveRemoteStream = () => {
          setRemoteStreamReady(true);
          appendLog('Call remote stream received');
        };
        listener.onReceiveDtmfDigit = (_eventCall, digit) =>
          appendLog(`Call DTMF received: ${digit}`);
        call.setListener(listener);
      }

      appendLog(
        `${incoming ? 'Incoming' : 'Outgoing'} ${mode}: ${call.from} -> ${call.to}`,
      );
    },
    [appendLog, releaseCall, resetVideo],
  );

  useEffect(() => {
    const client = new StringeeClient();
    const listener = new StringeeClientListener();

    listener.onConnect = (_connectedClient, connectedUserId) => {
      setConnected(true);
      setUserId(connectedUserId);
      setStatus(`Connected as ${connectedUserId}`);
      appendLog(`Client connected as ${connectedUserId}`);
    };
    listener.onDisConnect = () => {
      setConnected(false);
      setUserId('');
      setStatus('Disconnected');
      appendLog('Client disconnected');
    };
    listener.onFailWithError = (_failedClient, code, message) => {
      setConnected(false);
      setStatus(`Connection error ${code}`);
      appendLog(`Connection error ${code}: ${message}`);
    };
    listener.onRequestAccessToken = () => {
      setStatus('Access token expired');
      appendLog('Access token expired; reconnect with a new token');
    };
    listener.onIncomingCall = (_incomingClient, call) => {
      if (activeCallRef.current) {
        appendLog(`Rejected busy incoming Call from ${call.from}`);
        void call.reject();
        return;
      }
      bindCall(call, 'call', true);
    };
    listener.onIncomingCall2 = (_incomingClient, call) => {
      if (activeCallRef.current) {
        appendLog(`Rejected busy incoming Call2 from ${call.from}`);
        void call.reject();
        return;
      }
      bindCall(call, 'call2', true);
    };
    listener.onCustomMessage = (_messageClient, sender, data) => {
      appendLog(`Custom message from ${sender}: ${JSON.stringify(data)}`);
    };

    client.setListener(listener);
    clientRef.current = client;
    appendLog('StringeeClient initialized');

    return () => {
      const call = activeCallRef.current;
      if (call) {
        call.unregisterEvents();
        call.clean();
      }
      client.unregisterEvents();
      client.disconnect();
      clientRef.current = null;
    };
  }, [appendLog, bindCall]);

  const run = useCallback(
    async (label: string, action: () => Promise<unknown>) => {
      try {
        await action();
        appendLog(`${label}: success`);
      } catch (error) {
        const message = getErrorMessage(error);
        appendLog(`${label}: ${message}`);
        Alert.alert(label, message);
      }
    },
    [appendLog],
  );

  const connect = () => {
    const client = clientRef.current;
    if (!client || !token.trim()) {
      Alert.alert('Missing token', 'Paste a valid Stringee access token first.');
      return;
    }
    setStatus('Connecting...');
    appendLog('Connecting client');
    client.connect(token.trim());
  };

  const disconnect = () => {
    clientRef.current?.disconnect();
  };

  const makeCall = async () => {
    const client = clientRef.current;
    const destination = to.trim();
    const caller = from.trim() || client?.userId || '';
    if (!client || !connected || !caller || !destination) {
      Alert.alert(
        'Cannot make call',
        'Connect first and provide both caller and destination IDs.',
      );
      return;
    }
    if (!(await requestCallPermissions())) {
      Alert.alert('Permission required', 'Camera and microphone access are required.');
      return;
    }

    const call =
      callMode === 'call2'
        ? new StringeeCall2({stringeeClient: client, from: caller, to: destination})
        : new StringeeCall({stringeeClient: client, from: caller, to: destination});
    call.isVideoCall = videoEnabled;
    bindCall(call, callMode, false);
    await run('Make call', () => call.makeCall());
  };

  const answer = async () => {
    const call = activeCallRef.current;
    if (!call) {
      return;
    }
    if (!(await requestCallPermissions())) {
      Alert.alert('Permission required', 'Camera and microphone access are required.');
      return;
    }
    await run('Answer call', async () => {
      await call.initAnswer();
      await call.answer();
    });
  };

  const reject = async () => {
    const call = activeCallRef.current;
    if (call) {
      await run('Reject call', () => call.reject());
      releaseCall(call);
    }
  };

  const hangup = async () => {
    const call = activeCallRef.current;
    if (call) {
      await run('Hang up', () => call.hangup());
      releaseCall(call);
    }
  };

  const sendCustomMessage = async () => {
    const client = clientRef.current;
    if (!client || !to.trim() || !customMessage.trim()) {
      Alert.alert('Missing data', 'Provide a destination and message.');
      return;
    }
    await run('Send custom message', () =>
      client.sendCustomMessage(to.trim(), customMessage.trim()),
    );
  };

  const renderVideo = () => {
    if (!activeCall?.isVideoCall) {
      return null;
    }

    if (activeCallMode === 'call2') {
      return (
        <View style={styles.videoStage}>
          {remoteTrack ? (
            <StringeeVideoView
              style={styles.remoteVideo}
              videoTrack={remoteTrack}
              scalingType={StringeeVideoScalingType.fit}
            />
          ) : (
            <Text style={styles.videoPlaceholder}>Waiting for remote track…</Text>
          )}
          {localTrack ? (
            <StringeeVideoView
              style={styles.localVideo}
              videoTrack={localTrack}
              local
              scalingType={StringeeVideoScalingType.fill}
            />
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.videoStage}>
        {remoteStreamReady ? (
          <StringeeVideoView
            uuid={activeCall.uuid}
            style={styles.remoteVideo}
            scalingType={StringeeVideoScalingType.fit}
          />
        ) : (
          <Text style={styles.videoPlaceholder}>Waiting for remote stream…</Text>
        )}
        {localStreamReady ? (
          <StringeeVideoView
            uuid={activeCall.uuid}
            style={styles.localVideo}
            local
            scalingType={StringeeVideoScalingType.fill}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7fb" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Stringee React Native V2</Text>
          <Text style={styles.subtitle}>Local SDK sample · React Native 0.84 · TypeScript</Text>

          <View style={styles.statusCard}>
            <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>{status}</Text>
              {userId ? <Text style={styles.muted}>User ID: {userId}</Text> : null}
            </View>
          </View>

          <Section title="1. Connect">
            <TextInput
              value={token}
              onChangeText={setToken}
              placeholder="Access token"
              autoCapitalize="none"
              multiline
              style={[styles.input, styles.tokenInput]}
            />
            <View style={styles.buttonRow}>
              <Button title="Connect" onPress={connect} disabled={connected} />
              <Button title="Disconnect" onPress={disconnect} disabled={!connected} color="#59636e" />
            </View>
          </Section>

          <Section title="2. Call">
            <TextInput value={from} onChangeText={setFrom} placeholder="From (blank = connected user)" autoCapitalize="none" style={styles.input} />
            <TextInput value={to} onChangeText={setTo} placeholder="To user ID or phone number" autoCapitalize="none" style={styles.input} />
            <View style={styles.optionRow}>
              <Text style={styles.label}>API</Text>
              <Button title="Call" onPress={() => setCallMode('call')} color={callMode === 'call' ? '#1677ff' : '#8b96a3'} />
              <Button title="Call2" onPress={() => setCallMode('call2')} color={callMode === 'call2' ? '#1677ff' : '#8b96a3'} />
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.label}>Video</Text>
              <Switch value={videoEnabled} onValueChange={setVideoEnabled} />
            </View>
            <Button title={`Make ${videoEnabled ? 'video' : 'audio'} ${callMode}`} onPress={() => void makeCall()} disabled={!connected || !!activeCall} />
            {renderVideo()}
            {activeCall ? (
              <View style={styles.callControls}>
                <Button title="Answer" onPress={() => void answer()} color="#198754" />
                <Button title="Reject" onPress={() => void reject()} color="#dc3545" />
                <Button title="Hang up" onPress={() => void hangup()} color="#dc3545" />
                <Button title="Switch camera" onPress={() => void run('Switch camera', () => activeCall.switchCamera())} />
              </View>
            ) : null}
          </Section>

          <Section title="3. Custom message">
            <TextInput value={customMessage} onChangeText={setCustomMessage} placeholder="Message" style={styles.input} />
            <Button title="Send to the To user" onPress={() => void sendCustomMessage()} disabled={!connected} />
          </Section>

          <Section title="Event log">
            <Button title="Clear log" onPress={() => setLogs([])} color="#59636e" />
            {logs.length ? logs.map((line, index) => <Text key={`${line}-${index}`} style={styles.logLine}>{line}</Text>) : <Text style={styles.muted}>Events will appear here.</Text>}
          </Section>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Section({children, title}: React.PropsWithChildren<{title: string}>): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f4f7fb'},
  container: {padding: 18, gap: 14},
  title: {fontSize: 25, fontWeight: '700', color: '#142033'},
  subtitle: {fontSize: 14, color: '#667085', marginTop: -8},
  statusCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14},
  statusDot: {width: 11, height: 11, borderRadius: 6, backgroundColor: '#dc3545', marginRight: 10},
  statusDotConnected: {backgroundColor: '#198754'},
  statusText: {flex: 1},
  statusTitle: {fontSize: 16, fontWeight: '600', color: '#142033'},
  muted: {color: '#667085', marginTop: 5},
  section: {backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#142033'},
  input: {borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 8, color: '#142033', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff'},
  tokenInput: {minHeight: 72, textAlignVertical: 'top'},
  buttonRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  optionRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  label: {fontWeight: '600', color: '#344054', minWidth: 48},
  videoStage: {height: 280, borderRadius: 10, overflow: 'hidden', backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center'},
  remoteVideo: {position: 'absolute', width: '100%', height: 280, left: 0, top: 0},
  localVideo: {position: 'absolute', width: 100, height: 140, right: 10, top: 10, borderWidth: 1, borderColor: '#fff'},
  videoPlaceholder: {color: '#d0d5dd'},
  callControls: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  logLine: {fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}), fontSize: 12, color: '#344054', marginTop: 6},
});

export default App;
