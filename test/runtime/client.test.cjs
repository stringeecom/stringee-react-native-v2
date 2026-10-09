const assert = require('node:assert/strict');
const test = require('node:test');
const {loadSdk} = require('./sdk-test-harness.cjs');

function userPayload(id = 'user-1') {
  return {
    userId: id,
    name: `Name ${id}`,
    avatar: 'avatar',
    role: 'member',
    email: `${id}@example.com`,
    phone: '0123',
    location: 'HN',
    browser: 'Safari',
    platform: 'ios',
    device: 'phone',
    ipAddress: '127.0.0.1',
    hostName: 'localhost',
    userAgent: 'test',
  };
}

function messagePayload(id = 'message-1') {
  return {
    id,
    localId: `local-${id}`,
    conversationId: 'conversation-1',
    sender: 'user-1',
    createdAt: 1,
    state: 2,
    sequence: 3,
    type: 1,
    content: 'hello',
  };
}

function conversationPayload(id = 'conversation-1') {
  return {
    ...messagePayload('last-message'),
    id,
    name: `Conversation ${id}`,
    isGroup: false,
    updatedAt: 10,
    creator: 'user-1',
    created: 5,
    unreadCount: 1,
    participants: [userPayload('user-1'), userPayload('user-2')],
    lastMsgId: 'last-message',
    lastMsgSender: 'user-1',
    lastMsgCreatedAt: 9,
    lastMsgState: 2,
    lastMsgSeq: 3,
    lastMsgType: 1,
    text: 'last text',
    pinMsgId: null,
  };
}

function callPayload(overrides = {}) {
  return {
    uuid: `native-${Math.random()}`,
    callId: 'call-id',
    customDataFromYourServer: 'custom',
    from: 'alice',
    fromAlias: 'Alice',
    to: 'bob',
    toAlias: 'Bob',
    callType: 1,
    isVideoCall: true,
    serial: 1,
    ...overrides,
  };
}

test('StringeeClient forwards connection, push and live-chat operations', async () => {
  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const address = new sdk.StringeeServerAddress('server.example.com', 443);
  const client = new sdk.StringeeClient({
    baseUrl: 'https://base.example.com',
    stringeeXBaseUrl: 'https://x.example.com',
    serverAddresses: [address],
  });

  client.connect('token');
  await client.updateToken('new-token');
  assert.deepEqual(harness.callsFor('RNStringeeClient', 'updateToken')[0].slice(0, 2), [client.uuid, 'new-token']);
  client.disconnect();
  await client.registerPush('device-token', false, true);
  await client.registerPushAndDeleteOthers('device-token', false, true, ['com.example.app']);
  await client.unregisterPush('device-token');
  await client.sendCustomMessage('user-2', '{"hello":true}');
  await client.clearDb();

  harness.succeed('RNStringeeClient', 'getUnreadConversationCount', 7);
  assert.equal(await client.getUnreadConversationCount(), 7);
  harness.succeed('RNStringeeClient', 'getUserInfo', [userPayload()]);
  assert.equal((await client.getUserInfo(['user-1']))[0].userId, 'user-1');
  harness.succeed('RNStringeeClient', 'getChatProfile', {queues: []});
  assert.deepEqual(await client.getChatProfile('widget'), {queues: []});
  harness.succeed('RNStringeeClient', 'getLiveChatToken', 'live-token');
  assert.equal(await client.getLiveChatToken('widget', 'Name', 'email@example.com'), 'live-token');

  const userInfo = new sdk.UserInfo();
  userInfo.name = 'Updated';
  await client.updateUserInfo(userInfo);
  harness.succeed('RNStringeeClient', 'createLiveChatConversation', conversationPayload('live'));
  assert.equal((await client.createLiveChatConversation('queue')).id, 'live');
  await assert.rejects(client.createLiveChatTicket('widget'), error => error.code === -1);
  const ticket = new sdk.LiveChatTicketParam();
  ticket.name = 'Customer';
  ticket.email = 'customer@example.com';
  ticket.phone = '0123';
  ticket.note = 'Call back';
  await client.createLiveChatTicket('widget', ticket);

  harness.fail('RNStringeeClient', 'updateToken', -5, 'not requested');
  await assert.rejects(
    client.updateToken('rejected-token'),
    error => error.name === 'updateToken' && error.code === -5 && error.message === 'not requested',
  );

  harness.fail('RNStringeeClient', 'sendCustomMessage', 403, 'forbidden');
  await assert.rejects(
    client.sendCustomMessage('user-2', 'again'),
    error => error.name === 'sendCustomMessage' && error.code === 403,
  );
});

test('StringeeClient maps every conversation query to model instances', async () => {
  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const oneConversationMethods = [
    ['createConversation', [['user-2'], undefined]],
    ['getConversationById', ['conversation-1']],
    ['getConversationWithUser', ['user-2']],
  ];
  for (const [method, args] of oneConversationMethods) {
    harness.succeed('RNStringeeClient', method, conversationPayload(method));
    const conversation = await client[method](...args);
    assert.equal(conversation.id, method);
    assert.equal(conversation.stringeeClient, client);
  }

  const listMethods = [
    ['getLocalConversations', ['user-2', 10, true]],
    ['getLastConversations', [10, false]],
    ['getAllLastConversations', [10, true]],
    ['getConversationsAfter', [100, 10, false]],
    ['getAllConversationsAfter', [100, 10, true]],
    ['getConversationsBefore', [100, 10, false]],
    ['getAllConversationsBefore', [100, 10, true]],
    ['getLastUnreadConversations', [10, false]],
    ['getUnreadConversationsAfter', [100, 10, true]],
    ['getUnreadConversationsBefore', [100, 10, false]],
  ];
  for (const [method, args] of listMethods) {
    harness.succeed('RNStringeeClient', method, [
      conversationPayload(`${method}-1`),
      conversationPayload(`${method}-2`),
    ]);
    const conversations = await client[method](...args);
    assert.equal(conversations.length, 2);
    assert(conversations.every(conversation => conversation instanceof sdk.Conversation));
  }

  harness.fail('RNStringeeClient', 'getConversationById', 404, 'missing');
  await assert.rejects(client.getConversationById('missing'), error => error.code === 404);
});

test('StringeeClient uses Android-specific push and local conversation signatures', async () => {
  const harness = loadSdk({platform: 'android'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();

  await client.registerPush('android-token', false, false);
  await client.registerPushAndDeleteOthers('android-token', false, false, ['com.example']);
  harness.succeed('RNStringeeClient', 'getLocalConversations', [conversationPayload()]);
  const conversations = await client.getLocalConversations('user-2', 20, false);

  assert.equal(conversations.length, 1);
  assert.equal(harness.callsFor('RNStringeeClient', 'registerPushToken').length, 1);
  assert.equal(harness.callsFor('RNStringeeClient', 'getLocalConversations')[0].length, 3);
});

test('StringeeClient maps the Android token renewal event and native error codes', async () => {
  const harness = loadSdk({platform: 'android'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const listener = new sdk.StringeeClientListener();
  const received = [];
  listener.onTokenWillExpire = (eventClient, exp, expireInSeconds) =>
    received.push([eventClient === client, exp, expireInSeconds]);
  client.setListener(listener);

  harness.emit('onTokenWillExpire', {uuid: 'another-client', data: {exp: 1, expireInSeconds: 1}});
  harness.emit('onTokenWillExpire', {uuid: client.uuid, data: {exp: 1760000000, expireInSeconds: 59}});
  assert.deepEqual(received, [[true, 1760000000, 59]]);

  await client.updateToken('new-token');
  harness.fail('RNStringeeClient', 'updateToken', -4, 'Update access token timed out.');
  await assert.rejects(
    client.updateToken('slow-token'),
    error => error.name === 'updateToken' && error.code === -4,
  );
  client.unregisterEvents();
});

test('StringeeClient dispatches all connection, call and chat listener events', () => {
  const harness = loadSdk({platform: 'ios'});
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const listener = new sdk.StringeeClientListener();
  const received = [];

  listener.onConnect = (_client, id) => received.push(['connect', id]);
  listener.onDisConnect = () => received.push(['disconnect']);
  listener.onFailWithError = (_client, code, message) => received.push(['fail', code, message]);
  listener.onRequestAccessToken = () => received.push(['token']);
  listener.onTokenWillExpire = (_client, exp, expireInSeconds) => received.push(['token-will-expire', exp, expireInSeconds]);
  listener.onIncomingCall = (_client, call) => received.push(['call', call.callType, call.canAnswer]);
  listener.onIncomingCall2 = (_client, call) => received.push(['call2', call.callType, call.canAnswer]);
  listener.onCustomMessage = (_client, from, data) => received.push(['custom', from, data]);
  listener.onObjectChange = (_client, objectType, objects, changeType) => received.push(['object', objectType, objects[0].constructor.name, changeType]);
  listener.onReceiveChatRequest = (_client, request) => received.push(['chat', request.customerId]);
  listener.onReceiveTransferChatRequest = (_client, request) => received.push(['transfer', request.customerId]);
  listener.onTimeoutAnswerChat = (_client, request) => received.push(['timeout-answer', request.customerId]);
  listener.onTimeoutInQueue = (_client, convId, customerId, customerName) => received.push(['timeout-queue', convId, customerId, customerName]);
  listener.onConversationEnded = (_client, convId, endedBy) => received.push(['ended', convId, endedBy]);
  listener.onUserBeginTyping = (_client, convId, id, name) => received.push(['typing', convId, id, name]);
  listener.onUserEndTyping = (_client, convId, id, name) => received.push(['typed', convId, id, name]);
  client.setListener(listener);

  const emit = (eventName, data) => harness.emit(eventName, {uuid: client.uuid, data});
  harness.emit('didConnect', {uuid: 'another-client', data: {userId: 'ignored'}});
  emit('didConnect', {userId: 'user-1'});
  emit('didDisConnect', {});
  emit('didFailWithError', {code: 500, message: 'offline'});
  emit('requestAccessToken', {});
  emit('tokenWillExpire', {exp: 1760000000, expireInSeconds: 60});
  emit('incomingCall', callPayload({callType: 2}));
  emit('incomingCall2', callPayload({callType: 3}));
  emit('didReceiveCustomMessage', {from: 'user-2', data: {hello: true}});
  emit('objectChangeNotification', {objectType: 0, changeType: 1, objects: [conversationPayload()]});
  emit('objectChangeNotification', {objectType: 1, changeType: 2, objects: [messagePayload()]});
  const request = {convId: 'conv', channelType: 1, type: 1, customerId: 'customer', customerName: 'Customer'};
  emit('didReceiveChatRequest', {request});
  emit('didReceiveTransferChatRequest', {request});
  emit('timeoutAnswerChat', {request});
  emit('timeoutInQueue', {convId: 'conv', customerId: 'customer', customerName: 'Customer'});
  emit('conversationEnded', {convId: 'conv', endedby: 'agent'});
  emit('userBeginTyping', {convId: 'conv', userId: 'customer', displayName: 'Customer'});
  emit('userEndTyping', {convId: 'conv', userId: 'customer', displayName: 'Customer'});

  assert.equal(client.userId, 'user-1');
  assert.equal(client.isConnected, false);
  assert.equal(received.length, 17);
  assert.deepEqual(received[4], ['token-will-expire', 1760000000, 60]);
  assert.deepEqual(received[5], ['call', 'appToPhone', true]);
  assert.deepEqual(received[6], ['call2', 'phoneToApp', true]);
  assert.deepEqual(received[8], ['object', 'conversation', 'Conversation', 'update']);
  assert.deepEqual(received[9], ['object', 'message', 'Message', 'delete']);

  client.setListener(null);
  client.unregisterEvents();
});

module.exports = {conversationPayload, messagePayload, userPayload};
