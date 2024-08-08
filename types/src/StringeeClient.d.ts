export class StringeeClient {
  /**
   * Create the StringeeClient.
   * @param {Array<StringeeServerAddress>} props.serverAddresses List of server addresses
   * @param {string} props.baseUrl base url
   * @param {string} props.stringeeXBaseUrl base url for live chat
   */
  constructor(props: {
    baseUrl: string;
    stringeeXBaseUrl: string;
    serverAddresses: Array<StringeeServerAddress>;
  });

  userId: string;
  uuid: string;
  baseUrl: string;
  stringeeXBaseUrl: string;
  serverAddresses: Array<StringeeServerAddress>;
  isConnected: boolean;

  /**
   * Set listener for StringeeClient.
   * @function setListener
   * @param {StringeeClientListener} listener
   */
  setListener(listener: StringeeClientListener): void;

  /**
   * Unregister from listening to events from StringeeClient.
   * @function unregisterEvents
   */
  unregisterEvents(): void;

  /**
   * Connects to Stringee server, using provided access token.
   * @function connect
   * @param {string} token The access token generated by your server
   */
  connect(token: string): void;

  /**
   * Disconnects from Stringee server.
   * @function disconnect
   */
  disconnect(): void;

  /**
   * Register the device token to receive push notifications.
   * When you have an incoming call, you receive a notification from the Stringee server.
   * @function registerPush
   * @param {string} deviceToken The registration token
   * @param {boolean} isProduction (Ios) true: For production environment, false: For development environment
   * @param {boolean} isVoip (Ios) true: To receive voip push notification, false: To receive remote push notification
   */
  registerPush(deviceToken: string, isProduction: boolean, isVoip: boolean): Promise<void>;

  /**
   * Register the device token to receive push notifications and remove other devices with the package name from the list of receiving notification
   * When you have an incoming call, you receive a notification from the Stringee server
   * @function registerPushAndDeleteOthers
   * @param {string} deviceToken The registration token
   * @param {boolean} isProduction (Ios) true: For production environment, false: For development environment
   * @param {boolean} isVoip (Ios) true: To receive voip push notification, false: To receive remote push notification
   * @param {Array<string>} packageNames List of project's package names
   */
  registerPushAndDeleteOthers(deviceToken: string, isProduction: boolean, isVoip: boolean, packageNames: Array<string>): Promise<void>;

  /**
   * Remove your device token from Stringee server
   * Your device will not receive push notification when you have an incoming call.
   * @function unregisterPush
   * @param {string} deviceToken The registration token
   */
  unregisterPush(deviceToken: string): Promise<void>;

  /**
   * Send a custom message to a user.
   * @function sendCustomMessage
   * @param {string} toUserId User id to send a custom message to
   * @param {string} message Message to send
   */
  sendCustomMessage(toUserId: string, message: string): Promise<void>;

  /**
   * Construct a new conversation with the provided participants and options.
   * @function createConversation
   * @param {Array<string>} userIds User's id of participants
   * @param {ConversationOption} options Conversation options to use when constructing this conversation
   */
  createConversation(userIds: Array<string>, options: ConversationOption): Promise<Conversation>;

  /**
   * Get the existing conversation with given id.
   * @function getConversationById
   * @param {string} convId Conversation's id
   */
  getConversationById(convId: string): Promise<Conversation>;

  /**
   * Get conversations saved in your local database.
   * @function getLocalConversations
   * @param {string} userId Other user's id
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLocalConversations(userId: string, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get the latest conversations from the Stringee server.
   * @function getLastConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLastConversations(count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get the latest conversations including deleted conversations from the Stringee server.
   * @function getAllLastConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllLastConversations(count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getConversationsAfter(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of conversations including deleted conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getAllConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllConversationsAfter(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getConversationsBefore(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of conversations including deleted conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getAllConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getAllConversationsBefore(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get the latest unread conversations from the Stringee server.
   * @function getLastUnreadConversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLastUnreadConversations(count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of unread conversations with updated times greater than 'datetime' from the Stringee server.
   * @function getUnreadConversationsAfter
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getUnreadConversationsAfter(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get a list of unread conversations with updated times smaller than 'datetime' from the Stringee server.
   * @function getUnreadConversationsBefore
   * @param {number} datetime Number of conversations
   * @param {string} count Number of conversations
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getUnreadConversationsBefore(datetime: number, count: number, isAscending: boolean): Promise<Array<Conversation>>;

  /**
   * Get an existing conversations with given id of user.
   * @function getConversationWithUser
   * @param {string} userId other user's id
   */
  getConversationWithUser(userId: string): Promise<Conversation>;

  /**
   * Get the number of unread conversations.
   * @function getUnreadConversationCount
   */
  getUnreadConversationCount(): Promise<number>;

  /**
   * Clear the local database.
   * @function clearDb
   */
  clearDb(): Promise<void>;

  /**
   * Get the list of user's information with a given list of user's ids.
   * @function getUserInfo
   * @param {Array<string>} userIds List of user's ids.
   */
  getUserInfo(userIds: Array<string>): Promise<Array<User>>;

  /**
   * Get the portal's chat profile containing a list of queues.
   * @function getChatProfile
   * @param {string} widgetKey Portal's widgetKey
   */
  getChatProfile(widgetKey: string): Promise<Object>;

  /**
   * Get live chat token for customer.
   * @function getLiveChatToken
   * @param {string} widgetKey Portal's widgetKey
   * @param {string} name Customer's name
   * @param {string} email Customer's email
   */
  getLiveChatToken(widgetKey: string, name: string, email: string): Promise<string>;

  /**
   * Update the user information.
   * @function updateUserInfo
   * @param {UserInfo} userInfo
   */
  updateUserInfo(userInfo: UserInfo): Promise<void>;

  /**
   * Create a live chat conversation.
   * @function createLiveChatConversation
   * @param {string} queueId Queue's id
   */
  createLiveChatConversation(queueId: string): Promise<Conversation>;

  /**
   * Create a ticket if not during business hours.
   * @function createLiveChatTicket
   * @param {string} widgetKey Portal's widgetKey
   * @param {LiveChatTicketParam} liveChatTicketParam Param contain name, email, phone, note
   */
  createLiveChatTicket(widgetKey: string, liveChatTicketParam: LiveChatTicketParam): Promise<void>;
}

import { Conversation, ConversationOption, LiveChatTicketParam, StringeeClientListener, StringeeServerAddress, User, UserInfo } from "../index";
