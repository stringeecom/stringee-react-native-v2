import {
  RNStringeeClient,
  normalCallbackHandle,
} from '../helpers/StringeeHelper';
import {
  ConversationInfo,
  Message,
  NewMessageInfo,
  StringeeClient,
  User,
  StringeeError,
} from '../../index';

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
   */
  deleteConversation(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.deleteConversation(
        this.stringeeClient.uuid,
        this.id,
        normalCallbackHandle(resolve, reject),
      );
    });
  }

  /**
   * Add participants to the conversation.
   * @function addParticipants
   * @param {Array<string>} userIds List of user's ids
   */
  addParticipants(userIds: Array<string>): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.addParticipants(
        this.stringeeClient.uuid,
        this.id,
        userIds,
        (status, code, message, users) => {
          if (status) {
            let returnUsers = [];
            users.map(user => {
              returnUsers.push(new User(user));
            });
            resolve(returnUsers);
          } else {
            reject(new StringeeError(code, message, 'addParticipants'));
          }
        },
      );
    });
  }

  /**
   * Remove participants from the conversation.
   * @function removeParticipants
   * @param {Array<string>} userIds List of user's ids
   */
  removeParticipants(userIds: Array<string>): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.removeParticipants(
        this.stringeeClient.uuid,
        this.id,
        userIds,
        (status, code, message, users) => {
          if (status) {
            let returnUsers = [];
            users.map(user => {
              returnUsers.push(new User(user));
            });
            resolve(returnUsers);
          } else {
            reject(new StringeeError(code, message, 'removeParticipants'));
          }
        },
      );
    });
  }

  /**
   * Update the conversation's information.
   * @function updateConversation
   * @param {ConversationInfo} conversationInfo New information of the conversation
   */
  updateConversation(conversationInfo: ConversationInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      if (conversationInfo === undefined) {
        reject(
          new StringeeError(
            -1,
            'conversationInfo is undefined',
            'updateConversation',
          ),
        );
      }
      RNStringeeClient.updateConversation(
        this.stringeeClient.uuid,
        this.id,
        conversationInfo,
        normalCallbackHandle(resolve, reject, 'updateConversation'),
      );
    });
  }

  /**
   * Mark the conversation as read.
   * @function markConversationAsRead
   */
  markConversationAsRead(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.markConversationAsRead(
        this.stringeeClient.uuid,
        this.id,
        normalCallbackHandle(resolve, reject, 'markConversationAsRead'),
      );
    });
  }

  /**
   * Send begin typing event to other client.
   * @function sendBeginTyping
   */
  sendBeginTyping(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.sendBeginTyping(
        this.stringeeClient.uuid,
        this.id,
        normalCallbackHandle(resolve, reject, 'sendBeginTyping'),
      );
    });
  }

  /**
   * Send end typing event to other client.
   * @function sendEndTyping
   */
  sendEndTyping(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.sendEndTyping(
        this.stringeeClient.uuid,
        this.id,
        normalCallbackHandle(resolve, reject, 'sendEndTyping'),
      );
    });
  }

  /**
   * Send the message.
   * @function sendMessage
   * @param {NewMessageInfo} newMessageInfo Message to send
   */
  sendMessage(newMessageInfo: NewMessageInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.sendMessage(
        this.stringeeClient.uuid,
        newMessageInfo,
        normalCallbackHandle(resolve, reject, 'sendMessage'),
      );
    });
  }

  /**
   * Delete the message.
   * @function deleteMessage
   * @param {string} messageId Message's id to delete
   */
  deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.deleteMessage(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        normalCallbackHandle(resolve, reject, 'deleteMessage'),
      );
    });
  }

  /**
   * Revoke the message.
   * @function revokeMessage
   * @param {string} messageId Message's id to revoke
   */
  revokeMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.revokeMessage(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        normalCallbackHandle(resolve, reject, 'revokeMessage'),
      );
    });
  }

  /**
   * Get messages of the conversation saved in your local database.
   * @function getLocalMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   */
  getLocalMessages(
    count: number,
    isAscending: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getLocalMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(status, message, 'getLocalMessages'));
          }
        },
      );
    });
  }

  /**
   * Get the latest message of the conversation from the Stringee server.
   * @function getLastMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getLastMessages(
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getLastMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getLastMessages'));
          }
        },
      );
    });
  }

  /**
   * Get the latest message include deleted message of the conversation from the Stringee server.
   * @function getAllLastMessages
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getAllLastMessages(
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllLastMessages(
        this.stringeeClient.uuid,
        this.id,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getAllLastMessages'));
          }
        },
      );
    });
  }

  /**
   * Get a list of messages of conversation with sequence greater than 'sequence' from the Stringee server.
   * @function getMessagesAfter
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getMessagesAfter(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getMessagesAfter(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getMessagesAfter'));
          }
        },
      );
    });
  }

  /**
   * Get a list of messages include deleted message of conversation with sequence greater than 'sequence' from the Stringee server.
   * @function getAllMessagesAfter
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getAllMessagesAfter(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllMessagesAfter(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getAllMessagesAfter'));
          }
        },
      );
    });
  }

  /**
   * Get a list of messages of conversation with sequence smaller than 'sequence' from the Stringee server.
   * @function getMessagesBefore
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getMessagesBefore(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getMessagesBefore(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getMessagesBefore'));
          }
        },
      );
    });
  }

  /**
   * Get a list of messages include deleted message of conversation with sequence smaller than 'sequence' from the Stringee server.
   * @function getAllMessagesBefore
   * @param {number} sequence Sequence of message
   * @param {string} count Number of messages
   * @param {boolean} isAscending Sort order true: ascending, false: descending
   * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
   * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
   */
  getAllMessagesBefore(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
  ): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getAllMessagesBefore(
        this.stringeeClient.uuid,
        this.id,
        sequence,
        count,
        loadDeletedMessage,
        loadDeletedMessageContent,
        (status, code, message, messages) => {
          if (status) {
            let returnMessages = [];
            if (isAscending) {
              messages.map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            } else {
              messages.reverse().map(msg => {
                msg.stringeeClient = this.stringeeClient;
                returnMessages.push(new Message(msg));
              });
            }
            resolve(returnMessages);
          } else {
            reject(new StringeeError(code, message, 'getAllMessagesBefore'));
          }
        },
      );
    });
  }

  /**
   * Get the existing message with given id.
   * @function getMessageById
   * @param {string} messageId Message's id
   */
  getMessageById(messageId: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.getMessageById(
        this.stringeeClient.uuid,
        this.id,
        messageId,
        (status, code, message, msg) => {
          if (status) {
            msg.stringeeClient = this.stringeeClient;
            resolve(new Message(msg));
          } else {
            reject(new StringeeError(code, message, 'getMessageById'));
          }
        },
      );
    });
  }

  /**
   * End the support conversation
   * @function endChat
   */
  endChat(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.endChat(
        this.stringeeClient.uuid,
        this.id,
        normalCallbackHandle(resolve, reject, 'endChat'),
      );
    });
  }

  /**
   * Send chat's content to an email at any time.
   * @function sendChatTranscript
   * @param {string} email Email receive
   * @param {string} domain Stringee will send an email with "stringee" domain for default, you can change this by pass domain parameter with any string that you want.
   */
  sendChatTranscript(email: string, domain: string) {
    return new Promise((resolve, reject) => {
      RNStringeeClient.sendChatTranscript(
        this.stringeeClient.uuid,
        email,
        this.id,
        domain,
        normalCallbackHandle(resolve, reject, 'sendChatTranscript'),
      );
    });
  }
}

export {Conversation};
