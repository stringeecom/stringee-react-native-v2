import {NativeEventEmitter, NativeModules, Platform, View} from 'react-native';
import {
  clientEvents,
  RNStringeeClient,
  stringeeClientEvents,
} from './helpers/StringeeHelper';
import type {RNStringeeEventCallback} from './helpers/StringeeHelper';
import {
  ChatRequest,
  Conversation,
  LiveChatTicketParam,
  Message,
  StringeeCall,
  StringeeCall2,
  StringeeServerAddress,
  User,
  UserInfoParam,
  StringeeClientListener,
  ObjectType,
  ChangeType,
  CallType,
} from '../index';

const iOS = Platform.OS === 'ios';

class StringeeClientProps {
  baseUrl: string;
  stringeeXBaseUrl: string;
  serverAddresses: Array<StringeeServerAddress>;
}

class StringeeClient {
  userId: string;
  uuid: string;
  baseUrl: string;
  stringeeXBaseUrl: string;
  serverAddresses: Array<StringeeServerAddress>;
  isConnected: boolean;

  constructor(props: StringeeClientProps) {
    this.baseUrl = props.baseUrl;
    this.stringeeXBaseUrl = props.stringeeXBaseUrl;
    this.serverAddresses = props.serverAddresses;
    this.events = [];
    this.subscriptions = [];
    this.eventEmitter = new NativeEventEmitter(RNStringeeClient);

    // Sinh uuid va tao wrapper object trong native
    this.uuid =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    RNStringeeClient.createClientWrapper(
      this.uuid,
      this.baseUrl,
      this.serverAddresses,
      this.stringeeXBaseUrl,
    );
  }

  registerEvents(stringeeClientListener: StringeeClientListener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (stringeeClientListener) {
      stringeeClientEvents.forEach(event => {
        if (stringeeClientListener[event]) {
          this.eventEmitter.addListener(
            clientEvents[Platform.OS][event],
            ({uuid, data}) => {
              if (this.uuid !== uuid) {
                return;
              }
              switch (event) {
                case 'onConnect':
                  this.isConnected = true;
                  this.userId = data.userId;
                  stringeeClientListener.onConnect(this.userId);
                  break;
                case 'onDisConnect':
                  this.isConnected = false;
                  stringeeClientListener.onDisConnect();
                  break;
                case 'onFailWithError':
                  this.isConnected = false;
                  stringeeClientListener.onFailWithError(
                    data.code,
                    data.message,
                  );
                  break;
                case 'onRequestAccessToken':
                  stringeeClientListener.onRequestAccessToken();
                  break;
                case 'onIncomingCall':
                  let stringeeCall = new StringeeCall({
                    stringeeClient: this,
                    from: data.from,
                    to: data.to,
                  });
                  stringeeCall.callId = data.callId;
                  stringeeCall.customData = data.customDataFromYourServer;
                  stringeeCall.fromAlias = data.fromAlias;
                  stringeeCall.toAlias = data.toAlias;
                  switch (data.callType) {
                    case 1:
                    default:
                      stringeeCall.callType = CallType.appToAppIncoming;
                      break;
                    case 2:
                      stringeeCall.callType = CallType.appToPhone;
                      break;
                    case 3:
                      stringeeCall.callType = CallType.phoneToApp;
                      break;
                  }
                  stringeeCall.isVideoCall = data.isVideoCall;
                  stringeeClientListener.onIncomingCall(stringeeCall);
                  break;
                case 'onIncomingCall2':
                  let stringeeCall2 = new StringeeCall2({
                    stringeeClient: this,
                    from: data.from,
                    to: data.to,
                  });
                  stringeeCall2.callId = data.callId;
                  stringeeCall2.customData = data.customDataFromYourServer;
                  stringeeCall2.fromAlias = data.fromAlias;
                  stringeeCall2.toAlias = data.toAlias;
                  stringeeCall2.callType = CallType.appToAppIncoming;
                  stringeeCall2.isVideoCall = data.isVideoCall;
                  data.clientId = this.uuid;
                  stringeeClientListener.onIncomingCall2(stringeeCall2);
                  break;
                case 'onCustomMessage':
                  stringeeClientListener.onCustomMessage(data.from, data.data);
                  break;
                case 'onObjectChange':
                  const objectType =
                    data.objectType === 0
                      ? ObjectType.conversation
                      : ObjectType.message;
                  const objects = data.objects;
                  let changeType = ChangeType.insert;
                  if (data.changeType === 1) {
                    changeType = ChangeType.update;
                  } else if (data.changeType === 2) {
                    changeType = ChangeType.delete;
                  }

                  let objectChanges = [];
                  objects.map(object => {
                    object.clientId = this.uuid;
                    objectChanges.push(
                      objectType === ObjectType.conversation
                        ? new Conversation(object)
                        : new Message(object),
                    );
                  });
                  stringeeClientListener.onObjectChange(
                    objectType,
                    objectChanges,
                    changeType,
                  );
                  break;
                case 'onReceiveChatRequest':
                  data.request.clientId = this.uuid;
                  stringeeClientListener.onReceiveChatRequest(
                    new ChatRequest(data.request),
                  );
                  break;
                case 'onReceiveTransferChatRequest':
                  data.request.clientId = this.uuid;
                  stringeeClientListener.onReceiveTransferChatRequest(
                    new ChatRequest(data.request),
                  );
                  break;
                case 'onTimeoutAnswerChat':
                  data.request.clientId = this.uuid;
                  stringeeClientListener.onTimeoutAnswerChat(
                    new ChatRequest(data.request),
                  );
                  break;
                case 'onTimeoutInQueue':
                  stringeeClientListener.onTimeoutInQueue(
                    data.convId,
                    data.customerId,
                    data.customerName,
                  );
                  break;
                case 'onConversationEnded':
                  stringeeClientListener.onConversationEnded(
                    data.convId,
                    data.endedby,
                  );
                  break;
                case 'onUserBeginTyping':
                  stringeeClientListener.onUserBeginTyping(
                    data.convId,
                    data.userId,
                    data.displayName,
                  );
                  break;
                case 'onUserEndTyping':
                  stringeeClientListener.onUserEndTyping(
                    data.convId,
                    data.userId,
                    data.displayName,
                  );
                  break;
              }
            },
          );
          RNStringeeClient.setNativeEvent(
            this.uuid,
            clientEvents[Platform.OS][event],
          );
        }
      });
    }
  }

  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }
    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeClient.removeNativeEvent(this.uuid, e));
    this.events = [];
  }

  connect(token: string) {
    RNStringeeClient.connect(this.uuid, token);
  }

  disconnect() {
    RNStringeeClient.disconnect(this.uuid);
  }

  registerPush(
    deviceToken: string,
    isProduction: boolean,
    isVoip: boolean,
    callback: RNStringeeEventCallback,
  ) {
    if (iOS) {
      RNStringeeClient.registerPushForDeviceToken(
        this.uuid,
        deviceToken,
        isProduction,
        isVoip,
        callback,
      );
    } else {
      RNStringeeClient.registerPushToken(this.uuid, deviceToken, callback);
    }
  }

  registerPushAndDeleteOthers(
    deviceToken: string,
    isProduction: boolean,
    isVoip: boolean,
    packageNames: Array<string>,
    callback: RNStringeeEventCallback,
  ) {
    if (iOS) {
      RNStringeeClient.registerPushAndDeleteOthers(
        this.uuid,
        deviceToken,
        isProduction,
        isVoip,
        packageNames,
        callback,
      );
    } else {
      RNStringeeClient.registerPushAndDeleteOthers(
        this.uuid,
        deviceToken,
        packageNames,
        callback,
      );
    }
  }

  unregisterPush(deviceToken: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.unregisterPushToken(this.uuid, deviceToken, callback);
  }

  sendCustomMessage(
    toUserId: string,
    message: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.sendCustomMessage(this.uuid, toUserId, message, callback);
  }

  createConversation(
    userIds: string,
    options,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.createConversation(
      this.uuid,
      userIds,
      options,
      (status, code, message, conversation) => {
        let returnConversation;
        if (status) {
          conversation.clientId = this.uuid;
          returnConversation = new Conversation(conversation);
        }
        return callback(status, code, message, returnConversation);
      },
    );
  }

  getConversationById(convId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.getConversationById(
      this.uuid,
      convId,
      (status, code, message, conversation) => {
        let returnConversation;
        if (status) {
          conversation.clientId = this.uuid;
          returnConversation = new Conversation(conversation);
        }
        return callback(status, code, message, returnConversation);
      },
    );
  }

  getLocalConversations(
    userId: string,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    if (iOS) {
      // iOS su dung ca 2 tham so
      RNStringeeClient.getLocalConversations(
        this.uuid,
        count,
        userId,
        (status, code, message, conversations) => {
          let returnConversations = [];
          if (status) {
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.clientId = this.uuid;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.clientId = this.uuid;
                returnConversations.push(new Conversation(conversation));
              });
            }
          }
          return callback(status, code, message, returnConversations);
        },
      );
    } else {
      // Android chi su dung userId
      RNStringeeClient.getLocalConversations(
        this.uuid,
        userId,
        (status, code, message, conversations) => {
          let returnConversations = [];
          if (status) {
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.clientId = this.uuid;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.clientId = this.uuid;
                returnConversations.push(new Conversation(conversation));
              });
            }
          }
          return callback(status, code, message, returnConversations);
        },
      );
    }
  }

  getLastConversations(
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLastConversations(
      this.uuid,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getAllLastConversations(
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllLastConversations(
      this.uuid,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            // Tăng dần -> Cần đảo mảng
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getConversationsAfter(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getAllConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllConversationsAfter(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getConversationsBefore(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getAllConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllConversationsBefore(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getLastUnreadConversations(
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLastUnreadConversations(
      this.uuid,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            // Tăng dần -> Cần đảo mảng
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getUnreadConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getUnreadConversationsAfter(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getUnreadConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getUnreadConversationsBefore(
      this.uuid,
      datetime,
      count,
      (status, code, message, conversations) => {
        let returnConversations = [];
        if (status) {
          if (isAscending) {
            conversations.reverse().map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          } else {
            conversations.map(conversation => {
              conversation.clientId = this.uuid;
              returnConversations.push(new Conversation(conversation));
            });
          }
        }
        return callback(status, code, message, returnConversations);
      },
    );
  }

  getConversationWithUser(userId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.getConversationWithUser(
      this.uuid,
      userId,
      (status, code, message, conversation) => {
        let returnConversation;
        if (status) {
          conversation.clientId = this.uuid;
          returnConversation = new Conversation(conversation);
        }
        return callback(status, code, message, returnConversation);
      },
    );
  }

  getUnreadConversationCount(callback: RNStringeeEventCallback) {
    RNStringeeClient.getUnreadConversationCount(this.uuid, callback);
  }

  clearDb(callback: RNStringeeEventCallback) {
    RNStringeeClient.clearDb(this.uuid, callback);
  }

  getUserInfo(userIds: Array<string>, callback: RNStringeeEventCallback) {
    RNStringeeClient.getUserInfo(
      this.uuid,
      userIds,
      (status, code, message, users) => {
        let returnUsers = [];
        if (status) {
          users.map(user => {
            returnUsers.push(new User(user));
          });
        }
        return callback(status, code, message, returnUsers);
      },
    );
  }

  // ============================== LIVE-CHAT ================================

  getChatProfile(widgetKey: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.getChatProfile(this.uuid, widgetKey, callback);
  }

  getLiveChatToken(
    widgetKey: string,
    name: string,
    email: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLiveChatToken(
      this.uuid,
      widgetKey,
      name,
      email,
      callback,
    );
  }

  updateUserInfo(
    name: string,
    email: string,
    avatar: string,
    phone: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.updateUserInfo(
      this.uuid,
      name,
      email,
      avatar,
      phone,
      callback,
    );
  }

  updateUserInfoWithParam(
    param: UserInfoParam,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.updateUserInfo2(
      this.uuid,
      JSON.stringify(param),
      callback,
    );
  }

  createLiveChatConversation(
    queueId: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.createLiveChatConversation(
      this.uuid,
      queueId,
      (status, code, message, data) => {
        let returnConversation;
        if (status) {
          data.clientId = this.uuid;
          returnConversation = new Conversation(data);
        }
        return callback(status, code, message, returnConversation);
      },
    );
  }

  createLiveChatTicket(
    widgetKey: string,
    name: string,
    email: string,
    note: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.createLiveChatTicket(
      this.uuid,
      widgetKey,
      name,
      email,
      '',
      note,
      callback,
    );
  }

  createLiveChatTicketWithParam(
    widgetKey: string,
    param: LiveChatTicketParam,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.createLiveChatTicket(
      this.uuid,
      widgetKey,
      param.name,
      param.email,
      param.phone,
      param.note,
      callback,
    );
  }

  sendChatTranscript(
    email: string,
    convId: string,
    domain: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.sendChatTranscript(
      this.uuid,
      email,
      convId,
      domain,
      callback,
    );
  }
}
export {StringeeClient};
