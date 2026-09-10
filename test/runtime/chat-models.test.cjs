const assert = require('node:assert/strict');
const test = require('node:test');
const {loadSdk} = require('./sdk-test-harness.cjs');

const userPayload = (id = 'user-1') => ({
  userId: id,
  name: 'User',
  avatar: 'avatar',
  role: 'member',
  email: 'user@example.com',
  phone: '0123',
  location: 'HN',
  browser: 'Chrome',
  platform: 'android',
  device: 'phone',
  ipAddress: '127.0.0.1',
  hostName: 'localhost',
  userAgent: 'test',
});

const messagePayload = (id = 'message-1') => ({
  id,
  localId: `local-${id}`,
  conversationId: 'conversation-1',
  sender: 'user-1',
  createdAt: 10,
  state: 2,
  sequence: 3,
  type: 1,
  content: 'hello',
});

const conversationPayload = () => ({
  ...messagePayload('last'),
  id: 'conversation-1',
  name: 'Conversation',
  isGroup: false,
  updatedAt: 10,
  creator: 'user-1',
  created: 1,
  unreadCount: 2,
  participants: [userPayload()],
  lastMsgId: 'last',
  lastMsgSender: 'user-1',
  lastMsgCreatedAt: 9,
  lastMsgState: 2,
  lastMsgSeq: 3,
  lastMsgType: 1,
  text: 'last message',
  pinMsgId: 'pinned',
});

test('helper and chat model constructors preserve native payloads', () => {
  const {sdk} = loadSdk();
  const client = new sdk.StringeeClient();
  const user = new sdk.User(userPayload());
  const message = new sdk.Message({...messagePayload(), stringeeClient: client});
  const conversation = new sdk.Conversation({...conversationPayload(), stringeeClient: client});
  const request = new sdk.ChatRequest({
    stringeeClient: client,
    convId: 'conversation-1',
    channelType: 2,
    type: 1,
    customerId: 'customer',
    customerName: 'Customer',
  });
  const address = new sdk.StringeeServerAddress('localhost', 8080);
  const invalidAddress = new sdk.StringeeServerAddress('localhost', 1.5);
  const error = new sdk.StringeeError(400, 'Bad request', 'testMethod');

  assert.equal(user.userId, 'user-1');
  assert.equal(message.content, 'hello');
  assert.equal(conversation.participants[0].name, 'User');
  assert.equal(conversation.lastMessage.id, 'last');
  assert.equal(request.customerName, 'Customer');
  assert.equal(address.port, 8080);
  assert.equal(invalidAddress.port, 0);
  assert.match(error.toString(), /testMethod.*400.*Bad request/);

  assert.equal(new sdk.ConversationOption().isDistinct, true);
  assert.equal(new sdk.ConversationInfo().name, undefined);
  assert.equal(new sdk.LiveChatTicketParam().note, undefined);
  assert.equal(new sdk.UserInfo().email, undefined);
  assert.equal(new sdk.StringeeRoomUser().userId, undefined);

  const newMessage = new sdk.NewMessageInfo({
    convId: 'conversation-1',
    type: 1,
    message: {content: 'hello'},
  });
  assert.equal(newMessage.message.content, 'hello');

  const track = new sdk.StringeeVideoTrack({
    localId: 'local',
    serverId: 'server',
    isLocal: true,
    audio: true,
    video: true,
    screen: false,
    trackType: 2,
    publisher: {userId: 'publisher'},
  });
  assert.equal(track.trackType, 'player');
  assert.equal(track.publisher.userId, 'publisher');
});

test('Conversation and related models forward every chat operation', async () => {
  const harness = loadSdk();
  const {sdk} = harness;
  const client = new sdk.StringeeClient();
  const conversation = new sdk.Conversation({...conversationPayload(), stringeeClient: client});
  const message = new sdk.Message({...messagePayload(), stringeeClient: client});
  const request = new sdk.ChatRequest({
    stringeeClient: client,
    convId: conversation.id,
    channelType: 1,
    type: 1,
    customerId: 'customer',
    customerName: 'Customer',
  });

  await conversation.deleteConversation();
  harness.succeed('RNStringeeClient', 'addParticipants', [userPayload('added')]);
  assert.equal((await conversation.addParticipants(['added']))[0].userId, 'added');
  harness.succeed('RNStringeeClient', 'removeParticipants', [userPayload('removed')]);
  assert.equal((await conversation.removeParticipants(['removed']))[0].userId, 'removed');
  const info = new sdk.ConversationInfo();
  info.name = 'Updated';
  await conversation.updateConversation(info);
  await assert.rejects(conversation.updateConversation(undefined), error => error.code === -1);
  await conversation.markConversationAsRead();
  await conversation.sendBeginTyping();
  await conversation.sendEndTyping();
  await conversation.sendMessage(new sdk.NewMessageInfo({convId: conversation.id, type: 1, message: {content: 'hello'}}));
  await conversation.deleteMessage('message-1');
  await conversation.revokeMessage('message-1');

  const queryDefinitions = [
    ['getLocalMessages', [10, true]],
    ['getLastMessages', [10, false, false, false]],
    ['getAllLastMessages', [10, true, true, true]],
    ['getMessagesAfter', [5, 10, false, false, false]],
    ['getAllMessagesAfter', [5, 10, true, true, true]],
    ['getMessagesBefore', [5, 10, false, false, false]],
    ['getAllMessagesBefore', [5, 10, true, true, true]],
  ];
  for (const [method, args] of queryDefinitions) {
    harness.succeed('RNStringeeClient', method, [messagePayload(`${method}-1`), messagePayload(`${method}-2`)]);
    const messages = await conversation[method](...args);
    assert.equal(messages.length, 2);
    assert(messages.every(item => item instanceof sdk.Message));
  }

  harness.succeed('RNStringeeClient', 'getMessageById', messagePayload('fetched'));
  assert.equal((await conversation.getMessageById('fetched')).id, 'fetched');
  await conversation.endChat();
  await conversation.sendChatTranscript('customer@example.com', 'support');
  await message.pinMessage(true);
  await message.editMessage('edited');
  await request.acceptChatRequest();
  await request.rejectChatRequest();

  harness.fail('RNStringeeClient', 'getMessageById', 404, 'missing');
  await assert.rejects(conversation.getMessageById('missing'), error => error.code === 404);
});
