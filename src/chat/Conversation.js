import User from './User';
import Message from './Message';
import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';
import type {StringeeClient} from '../StringeeClient';
import type {ConversationInfo} from '../helpers/ConversationInfo';
import {NewMessageInfo} from '../helpers/NewMessageInfo';

class Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  updatedAt: number;
  creator: string;
  created: number;
  unreadCount: number;
  participants: Array<User>;
  lastMessage: Message;
  pinMsgId: string;
  stringeeClient: StringeeClient;
  constructor(props) {
    this.stringeeClient = props.stringeeClient;
    this.id = props.id;
    this.name = props.name;
    this.isGroup = props.isGroup;
    this.updatedAt = props.updatedAt;
    this.creator = props.creator;
    this.created = props.created;
    this.unreadCount = props.unreadCount;

    let parts: Array<User> = [];
    let tempParts = props.participants;
    tempParts.map(part => {
      let user = new User(part);
      parts.push(user);
    });
    this.participants = parts;

    this.lastMessage = new Message(props);
    this.lastMessage.localId = null;
    this.lastMessage.id = props.lastMsgId;
    this.lastMessage.conversationId = this.id;
    this.lastMessage.sender = props.lastMsgSender;
    this.lastMessage.createdAt = props.lastMsgCreatedAt;
    this.lastMessage.state = props.lastMsgState;
    this.lastMessage.sequence = props.lastMsgSeq;
    this.lastMessage.type = props.lastMsgType;
    this.lastMessage.content = props.text;

    this.pinMsgId = props.pinMsgId != null ? props.pinMsgId : null;
  }

  /**
   * Delete the conversation
   * @function deleteConversation
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  deleteConversation(callback: RNStringeeEventCallback) {
    RNStringeeClient.deleteConversation(
        this.stringeeClient.uuid,
        this.id,
        callback,
    );
  }

  /**
   * Add participants to the conversation.
   * @function addParticipants
   * @param {Array<string>} userIds List of user's ids
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  addParticipants(userIds: Array<string>, callback: RNStringeeEventCallback) {
    RNStringeeClient.addParticipants(
        this.stringeeClient.uuid,
        this.id,
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

  /**
   * Remove participants from the conversation.
   * @function removeParticipants
   * @param {Array<string>} userIds List of user's ids
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  removeParticipants(
      userIds: Array<string>,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.removeParticipants(
        this.stringeeClient.uuid,
        this.id,
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

  /**
   * Update the conversation's information.
   * @function updateConversation
   * @param {ConversationInfo} conversationInfo New information of the conversation
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  updateConversation(
      conversationInfo: ConversationInfo,
      callback: RNStringeeEventCallback,
  ) {
    if (conversationInfo === undefined) {
      callback(false, -1, 'conversationInfo is undefined');
      return;
    }
    RNStringeeClient.updateConversation(
        this.stringeeClient.uuid,
        this.id,
        conversationInfo,
        callback,
    );
  }

  /**
   * Mark the conversation as read.
   * @function markConversationAsRead
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  markConversationAsRead(callback: RNStringeeEventCallback) {
    RNStringeeClient.markConversationAsRead(
        this.stringeeClient.uuid,
        this.id,
        callback,
    );
  }

  /**
   * Send begin typing event to other client.
   * @function sendBeginTyping
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendBeginTyping(callback: RNStringeeEventCallback) {
    RNStringeeClient.sendBeginTyping(
        this.stringeeClient.uuid,
        this.id,
        callback,
    );
  }

  /**
   * Send end typing event to other client.
   * @function sendEndTyping
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendEndTyping(callback: RNStringeeEventCallback) {
    RNStringeeClient.sendEndTyping(this.stringeeClient.uuid, this.id, callback);
  }

  /**
   * Send the message.
   * @function sendMessage
   * @param {NewMessageInfo} message Message to send
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendMessage(message: NewMessageInfo, callback: RNStringeeEventCallback) {
    RNStringeeClient.sendMessage(this.stringeeClient.uuid, message, callback);
  }

  /**
   * Delete the message.
   * @function deleteMessage
   * @param {string} messageId Message's id to delete
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  deleteMessage(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.deleteMessage(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        callback,
    );
  }

  /**
   * Revoke the message.
   * @function revokeMessage
   * @param {string} messageId Message's id to revoke
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  revokeMessage(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.revokeMessage(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        callback,
    );
  }

  /**
   * Get messages of the conversation saved in your local database.
   * @function getLocalMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getLocalMessages(
      count: number,
      isAscending: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLocalMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get the latest message of the conversation from the Stringee server.
   * @function getLastMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getLastMessages(
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLastMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get the latest message include deleted message of the conversation from the Stringee server.
   * @function getAllLastMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getAllLastMessages(
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllLastMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get a list of messages of conversation with sequence greater than 'sequence' from the Stringee server.
   * @function getMessagesAfter
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getMessagesAfter(
      sequence: number,
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getMessagesAfter(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get a list of messages include deleted message of conversation with sequence greater than 'sequence' from the Stringee server.
   * @function getAllMessagesAfter
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getAllMessagesAfter(
      sequence: number,
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllMessagesAfter(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get a list of messages of conversation with sequence smaller than 'sequence' from the Stringee server.
   * @function getMessagesBefore
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getMessagesBefore(
      sequence: number,
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getMessagesBefore(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get a list of messages include deleted message of conversation with sequence smaller than 'sequence' from the Stringee server.
   * @function getAllMessagesBefore
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getAllMessagesBefore(
      sequence: number,
      count: number,
      isAscending: boolean,
      loadDeletedMessage: boolean,
      loadDeletedMessageContent: boolean,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllMessagesBefore(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          let returnMessages = [];
          if (status) {
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient.uuid;
                returnMessages.push(new Message(msg));
              });
            }
          }
          return callback(status, code, message, returnMessages);
        },
    );
  }

  /**
   * Get the existing message with given id.
   * @function getMessageById
   * @param {string} messageId Message's id
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  getMessageById(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.getMessageById(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        (status, code, message, msg) => {
          msg.clientId = this.stringeeClient.uuid;
          return callback(status, code, message, new Message(msg));
        },
    );
  }

  /**
   * End the support conversation
   * @function endChat
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  endChat(callback: RNStringeeEventCallback) {
    RNStringeeClient.endChat(this.stringeeClient.uuid, this.id, callback);
  }

  /**
   * Send chat's content to an email at any time.
   * @function sendChatTranscript
   * @param {string} email Email receive
   * @param {string} domain Stringee will send an email with "stringee" domain for default, you can change this by pass domain parameter with any string that you want.
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  sendChatTranscript(
      email: string,
      domain: string,
      callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.sendChatTranscript(
        this.stringeeClient.uuid,
        email,
        this.id,
        domain,
        callback,
    );
  }
}

export default Conversation;
