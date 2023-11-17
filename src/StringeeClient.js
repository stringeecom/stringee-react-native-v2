import {EmitterSubscription, NativeEventEmitter, Platform} from 'react-native';
import {
  CallType,
  clientEvents,
  RNStringeeClient,
  stringeeClientEvents,
  isIOS,
  normalCallbackHandle,
} from './helpers/StringeeHelper';
import {
  ChangeType,
  ChatRequest,
  Conversation,
  ConversationOption,
  Message,
  ObjectType,
  StringeeCall,
  StringeeCall2,
  StringeeClientListener,
  StringeeServerAddress,
  User,
  UserInfo,
  LiveChatTicketParam,
  StringeeError,
} from '../index';

class StringeeClient {
  userId: string;
  uuid: string;
  baseUrl: string;
  stringeeXBaseUrl: string;
  serverAddresses: Array<StringeeServerAddress>;
  isConnected: boolean;

  /**
   * Create the StringeeClient.
   * @param {Array<StringeeServerAddress>} props.serverAddresses List of server addresses
   * @param {string} props.baseUrl base url
   * @param {string} props.stringeeXBaseUrl base url for live chat
   */
  constructor(props: {
    baseUrl: string,
    stringeeXBaseUrl: string,
    serverAddresses: Array<StringeeServerAddress>,
  }) {
    if (props === undefined) {
      props = {};
    }
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

  /**
   * Register to listen to events from StringeeClient.
   * @function registerEvents
   * @param {StringeeClientListener} listener
   */
  registerEvents(listener: StringeeClientListener) {
    if (this.events.length !== 0 && this.subscriptions.length !== 0) {
      return;
    }
    if (listener) {
      stringeeClientEvents.forEach(event => {
        if (listener[event] && clientEvents[Platform.OS][event]) {
          let emitterSubscription: EmitterSubscription =
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
                    listener.onConnect(this, this.userId);
                    break;
                  case 'onDisConnect':
                    this.isConnected = false;
                    listener.onDisConnect(this);
                    break;
                  case 'onFailWithError':
                    this.isConnected = false;
                    listener.onFailWithError(this, data.code, data.message);
                    break;
                  case 'onRequestAccessToken':
                    listener.onRequestAccessToken(this);
                    break;
                  case 'onIncomingCall':
                    listener.onIncomingCall(this, getStringeeCall(this, data));
                    break;
                  case 'onIncomingCall2':
                    listener.onIncomingCall2(
                      this,
                      getStringeeCall2(this, data),
                    );
                    break;
                  case 'onCustomMessage':
                    listener.onCustomMessage(this, data.from, data.data);
                    break;
                  case 'onObjectChange':
                    const objectType = getObjectType(data.objectType);
                    let objectChanges = [];
                    data.objects.map(object => {
                      object.stringeeClient = this;
                      objectChanges.push(
                        objectType === ObjectType.conversation
                          ? new Conversation(object)
                          : new Message(object),
                      );
                    });
                    listener.onObjectChange(
                      this,
                      objectType,
                      objectChanges,
                      getChangeType(data.changeType),
                    );
                    break;
                  case 'onReceiveChatRequest':
                    data.request.stringeeClient = this;
                    listener.onReceiveChatRequest(
                      this,
                      new ChatRequest(data.request),
                    );
                    break;
                  case 'onReceiveTransferChatRequest':
                    data.request.stringeeClient = this;
                    listener.onReceiveTransferChatRequest(
                      this,
                      new ChatRequest(data.request),
                    );
                    break;
                  case 'onTimeoutAnswerChat':
                    data.request.stringeeClient = this;
                    listener.onTimeoutAnswerChat(
                      this,
                      new ChatRequest(data.request),
                    );
                    break;
                  case 'onTimeoutInQueue':
                    listener.onTimeoutInQueue(
                      this,
                      data.convId,
                      data.customerId,
                      data.customerName,
                    );
                    break;
                  case 'onConversationEnded':
                    listener.onConversationEnded(
                      this,
                      data.convId,
                      data.endedby,
                    );
                    break;
                  case 'onUserBeginTyping':
                    listener.onUserBeginTyping(
                      this,
                      data.convId,
                      data.userId,
                      data.displayName,
                    );
                    break;
                  case 'onUserEndTyping':
                    listener.onUserEndTyping(
                      this,
                      data.convId,
                      data.userId,
                      data.displayName,
                    );
                    break;
                }
              },
            );
          this.subscriptions.push(emitterSubscription);
          this.events.push(clientEvents[Platform.OS][event]);
          RNStringeeClient.setNativeEvent(
            this.uuid,
            clientEvents[Platform.OS][event],
          );
        }
      });
    }
  }

  /**
   * Unregister from listening to events from StringeeClient.
   * @function unregisterEvents
   */
  unregisterEvents() {
    if (this.events.length === 0 && this.subscriptions.length === 0) {
      return;
    }
    this.subscriptions.forEach(e => e.remove());
    this.subscriptions = [];

    this.events.forEach(e => RNStringeeClient.removeNativeEvent(this.uuid, e));
    this.events = [];
  }

  /**
   * Connects to Stringee server, using provided access token.
   * @function connect
   * @param {string} token The access token generated by your server
   */
  connect(token: string) {
    RNStringeeClient.connect(this.uuid, token);
  }

  /**
   * Disconnects from Stringee server.
   * @function disconnect
   */
  disconnect() {
    RNStringeeClient.disconnect(this.uuid);
  }

  /**
   * Register the device token to receive push notifications.
   * When you have an incoming call, you receive a notification from the Stringee server.
   * @function registerPush
   * @param {string} deviceToken The registration token
   * @param {boolean} isProduction (Ios) true: For production environment, false: For development environment
   * @param {boolean} isVoip (Ios) true: To receive voip push notification, false: To receive remote push notification
   */
  registerPush(
    deviceToken: string,
    isProduction: boolean,
    isVoip: boolean,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const callback = normalCallbackHandle(resolve, reject, 'registerPush');
      if (isIOS) {
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
    });
  }

  /**
   * Register the device token to receive push notifications and remove other devices with the package name from the list of receiving notification
   * When you have an incoming call, you receive a notification from the Stringee server
   * @function registerPushAndDeleteOthers
   * @param {string} deviceToken The registration token
   * @param {boolean} isProduction (Ios) true: For production environment, false: For development environment
   * @param {boolean} isVoip (Ios) true: To receive voip push notification, false: To receive remote push notification
   * @param {Array<string>} packageNames List of project's package names
   */
  registerPushAndDeleteOthers(
    deviceToken: string,
    isProduction: boolean,
    isVoip: boolean,
    packageNames: Array<string>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const callback = normalCallbackHandle(resolve, reject, 'registerPushAndDeleteOthers')
      if (isIOS) {
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
    });
  }

  /**
   * Remove your device token from Stringee server
   * Your device will not receive push notification when you have an incoming call.
   * @function unregisterPush
   * @param {string} deviceToken The registration token
   */
  unregisterPush(deviceToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.unregisterPushToken(
        this.uuid,
        deviceToken,
        normalCallbackHandle(resolve, reject, 'unregisterPush')
      );
    });
  }

  /**
   * Send a custom message to a user.
   * @function sendCustomMessage
   * @param {string} toUserId User id to send a custom message to
   * @param {string} message Message to send
   */
  sendCustomMessage(toUserId: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.sendCustomMessage(
        this.uuid,
        toUserId,
        message,
        normalCallbackHandle(resolve, reject, 'sendCustomMessage')
      );
    });
  }

  /**
   * Construct a new conversation with the provided participants and options.
   * @function createConversation
   * @param {Array<string>} userIds User's id of participants
   * @param {ConversationOption} options Conversation options to use when constructing this conversation
   */
  createConversation(
    userIds: Array<string>,
    options: ConversationOption,
  ): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      if (options === undefined) {
        options = new ConversationOption();
      }
      RNStringeeClient.createConversation(
        this.uuid,
        userIds,
        options,
        (status, code, message, conversation) => {
          if (status) {
            conversation.stringeeClient = this;
            resolve(new Conversation(conversation));
          } else {
            reject(new StringeeError(code, message, 'createConversation'));
          }
        },
      );
    });
  }

  /**
   * Get the existing conversation with given id.
   * @function getConversationById
   * @param {string} convId Conversation's id
   */
  getConversationById(convId: string): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getConversationById(
        this.uuid,
        convId,
        (status, code, message, conversation) => {
          if (status) {
            conversation.stringeeClient = this;
            resolve(new Conversation(conversation));
          } else {
            reject(new StringeeError(code, message, 'getConversationById'));
          }
        },
      );
    });
  }

  /**
   * Get conversations saved in your local database.
   * @function getLocalConversations
   * @param {string} userId Other user's id
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLocalConversations(
    userId: string,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      const callback = (status, code, message, conversations) => {
        if (status) {
          resolve(conversations);
        } else {
          reject(new StringeeError(code, message, 'getLocalConversations'));
        }
      };
      if (isIOS) {
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
                  conversation.stringeeClient = this;
                  returnConversations.push(new Conversation(conversation));
                });
              } else {
                conversations.map(conversation => {
                  conversation.stringeeClient = this;
                  returnConversations.push(new Conversation(conversation));
                });
              }
            }
            callback(status, code, message, returnConversations);
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
                  conversation.stringeeClient = this;
                  returnConversations.push(new Conversation(conversation));
                });
              } else {
                conversations.map(conversation => {
                  conversation.stringeeClient = this;
                  returnConversations.push(new Conversation(conversation));
                });
              }
            }
            callback(status, code, message, returnConversations);
          },
        );
      }
    });
  }

  /**
   * Get the latest conversations from the Stringee server.
   * @function getLastConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLastConversations(
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getLastConversations(
        this.uuid,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getLastConversations'));
          }
        },
      );
    });
  }

  /**
   * Get the latest conversations including deleted conversations from the Stringee server.
   * @function getAllLastConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllLastConversations(
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllLastConversations(
        this.uuid,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              // Tăng dần -> Cần đảo mảng
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getAllLastConversations'));
          }
        },
      );
    });
  }

  /**
   * Get a list of conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getConversationsAfter(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getConversationsAfter'));
          }
        },
      );
    });
  }

  /**
   * Get a list of conversations including deleted conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getAllConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllConversationsAfter(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getAllConversationsAfter'));
          }
        },
      );
    });
  }

  /**
   * Get a list of conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getConversationsBefore(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getConversationsBefore'));
          }
        },
      );
    });
  }

  /**
   * Get a list of conversations including deleted conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getAllConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllConversationsBefore(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getAllConversationsBefore'));
          }
        },
      );
    });
  }

  /**
   * Get the latest unread conversations from the Stringee server.
   * @function getLastUnreadConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLastUnreadConversations(
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getLastUnreadConversations(
        this.uuid,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              // Tăng dần -> Cần đảo mảng
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getLastUnreadConversations'));
          }
        },
      );
    });
  }

  /**
   * Get a list of unread conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getUnreadConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getUnreadConversationsAfter(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getUnreadConversationsAfter(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getUnreadConversationsAfter'));
          }
        },
      );
    });
  }

  /**
   * Get a list of unread conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getUnreadConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getUnreadConversationsBefore(
    datetime: number,
    count: number,
    isAscending: boolean,
  ): Promise<Array<Conversation>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getUnreadConversationsBefore(
        this.uuid,
        datetime,
        count,
        (status, code, message, conversations) => {
          if (status) {
            let returnConversations = [];
            if (isAscending) {
              conversations.reverse().map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            } else {
              conversations.map(conversation => {
                conversation.stringeeClient = this;
                returnConversations.push(new Conversation(conversation));
              });
            }
            resolve(returnConversations);
          } else {
            reject(new StringeeError(code, message, 'getUnreadConversationsBefore'));
          }
        },
      );
    });
  }

  /**
   * Get an existing conversations with given id of user.
   * @function getConversationWithUser
   * @param {string} userId other user's id
   */
  getConversationWithUser(userId: string): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getConversationWithUser(
        this.uuid,
        userId,
        (status, code, message, conversation) => {
          if (status) {
            conversation.stringeeClient = this;
            resolve(new Conversation(conversation));
          } else {
            reject(new StringeeError(code, message, 'getConversationWithUser'));
          }
        },
      );
    });
  }

  /**
   * Get the number of unread conversations.
   * @function getUnreadConversationCount
   */
  getUnreadConversationCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getUnreadConversationCount(
        this.uuid,
        (status, code, message, count) => {
          if (status) {
            resolve(count);
          } else {
            reject(new StringeeError(code, message, 'getUnreadConversationCount'));
          }
        },
      );
    });
  }

  /**
   * Clear the local database.
   * @function clearDb
   */
  clearDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.clearDb(this.uuid, normalCallbackHandle(resolve, reject, 'clearDb'))
    });
  }

  /**
   * Get the list of user's information with a given list of user's ids.
   * @function getUserInfo
   * @param {Array<string>} userIds List of user's ids.
   */
  getUserInfo(userIds: Array<string>): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getUserInfo(
        this.uuid,
        userIds,
        (status, code, message, users) => {
          if (status) {
            let returnUsers = [];
            users.map(user => {
              returnUsers.push(new User(user));
            });
            resolve(returnUsers);
          } else {
            reject(new StringeeError(code, message, 'getUserInfo'));
          }
        },
      );
    });
  }

  // ============================== LIVE-CHAT ================================

  /**
   * Get the portal's chat profile containing a list of queues.
   * @function getChatProfile
   * @param {string} widgetKey Portal's widgetKey
   */
  getChatProfile(widgetKey: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getChatProfile(
        this.uuid,
        widgetKey,
        (status, code, message, chatProfile) => {
          if (status) {
            resolve(chatProfile);
          } else {
            reject(new StringeeError(code, message, 'getChatProfile'));
          }
        },
      );
    });
  }

  /**
   * Get live chat token for customer.
   * @function getLiveChatToken
   * @param {string} widgetKey Portal's widgetKey
   * @param {string} name Customer's name
   * @param {string} email Customer's email
   */
  getLiveChatToken(
    widgetKey: string,
    name: string,
    email: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getLiveChatToken(
        this.uuid,
        widgetKey,
        name,
        email,
        (status, code, message, token) => {
          if (status) {
            resolve(token);
          } else {
            reject(new StringeeError(code, message, 'getLiveChatToken'));
          }
        },
      );
    });
  }

  /**
   * Update the user information.
   * @function updateUserInfo
   * @param {UserInfo} userInfo
   */
  updateUserInfo(userInfo: UserInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.updateUserInfo2(
        this.uuid,
        JSON.stringify(userInfo),
        normalCallbackHandle(resolve, reject, 'updateUserInfo')
      );
    });
  }

  /**
   * Create a live chat conversation.
   * @function createLiveChatConversation
   * @param {string} queueId Queue's id
   */
  createLiveChatConversation(queueId: string): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.createLiveChatConversation(
        this.uuid,
        queueId,
        (status, code, message, conversation) => {
          if (status) {
            conversation.stringeeClient = this;
            resolve(Conversation(conversation));
          } else {
            reject(new StringeeError(code, message, 'createLiveChatConversation'));
          }
        },
      );
    });
  }

  /**
   * Create a ticket if not during business hours.
   * @function createLiveChatTicket
   * @param {string} widgetKey Portal's widgetKey
   * @param {LiveChatTicketParam} liveChatTicketParam Param contain name, email, phone, note
   */
  createLiveChatTicket(
    widgetKey: string,
    liveChatTicketParam: LiveChatTicketParam,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (liveChatTicketParam === undefined) {
        reject(new StringeeError(-1, 'liveChatTicketParam is undefined', 'createLiveChatTicket'));
        return;
      }
      RNStringeeClient.createLiveChatTicket(
        this.uuid,
        widgetKey,
        liveChatTicketParam.name,
        liveChatTicketParam.email,
        liveChatTicketParam.phone,
        liveChatTicketParam.note,
        (status, code, message) => {
          if (status) {
            resolve();
          } else {
            reject(new StringeeError(code, message, 'createLiveChatTicket'));
          }
        },
      );
    });
  }
}

function getStringeeCall(stringeeClient: StringeeClient, data): StringeeCall {
  let stringeeCall = new StringeeCall({
    stringeeClient: stringeeClient,
    from: data.from,
    to: data.to,
  });
  stringeeCall.callId = data.callId;
  stringeeCall.customData = data.customDataFromYourServer;
  stringeeCall.fromAlias = data.fromAlias;
  stringeeCall.toAlias = data.toAlias;
  stringeeCall.callType = getCallType(data.callType);
  stringeeCall.isVideoCall = data.isVideoCall;
  stringeeCall.serial = data.serial;
  return stringeeCall;
}

function getStringeeCall2(stringeeClient: StringeeClient, data): StringeeCall2 {
  let stringeeCall2 = new StringeeCall2({
    stringeeClient: stringeeClient,
    from: data.from,
    to: data.to,
  });
  stringeeCall2.callId = data.callId;
  stringeeCall2.customData = data.customDataFromYourServer;
  stringeeCall2.fromAlias = data.fromAlias;
  stringeeCall2.toAlias = data.toAlias;
  stringeeCall2.callType = getCallType(data.callType);
  stringeeCall2.isVideoCall = data.isVideoCall;
  stringeeCall2.serial = data.serial;
  return stringeeCall2;
}

function getCallType(nativeType: number): CallType {
  switch (nativeType) {
    case 0:
      return CallType.appToAppOutgoing;
    case 1:
      return CallType.appToAppIncoming;
    case 2:
      return CallType.appToPhone;
    case 3:
      return CallType.phoneToApp;
    default:
      return CallType.appToAppOutgoing;
  }
}

function getObjectType(nativeType: number): ObjectType {
  switch (nativeType) {
    case 0:
      return ObjectType.conversation;
    case 1:
      return ObjectType.message;
    default:
      return ObjectType.conversation;
  }
}

function getChangeType(nativeType: number): ChangeType {
  switch (nativeType) {
    case 0:
      return ChangeType.insert;
    case 1:
      return ChangeType.update;
    case 2:
      return ChangeType.delete;
    default:
      return ChangeType.insert;
  }
}

export {StringeeClient};
