import User from './User';
import Message from './Message';
import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';

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
  constructor(props) {
    this.clientId = props.clientId;
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

  deleteConversation(callback: RNStringeeEventCallback) {
    RNStringeeClient.deleteConversation(this.clientId, this.id, callback);
  }

  addParticipants(userIds: Array<string>, callback: RNStringeeEventCallback) {
    RNStringeeClient.addParticipants(
      this.clientId,
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

  removeParticipants(
    userIds: Array<string>,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.removeParticipants(
      this.clientId,
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

  updateConversation(
    params: {name: string, avatar: string},
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.updateConversation(
      this.clientId,
      this.id,
      params,
      callback,
    );
  }

  markConversationAsRead(callback: RNStringeeEventCallback) {
    RNStringeeClient.markConversationAsRead(this.clientId, this.id, callback);
  }

  sendBeginTyping(callback: RNStringeeEventCallback) {
    RNStringeeClient.sendBeginTyping(this.clientId, this.id, callback);
  }

  sendEndTyping(callback: RNStringeeEventCallback) {
    RNStringeeClient.sendEndTyping(this.clientId, this.id, callback);
  }

  sendMessage(
    message: {convId: string, type: number, message: {}},
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.sendMessage(this.clientId, message, callback);
  }

  deleteMessage(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.deleteMessage(this.clientId, this.id, messageId, callback);
  }

  revokeMessage(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.revokeMessage(this.clientId, this.id, messageId, callback);
  }

  getLocalMessages(
    count: number,
    isAscending: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLocalMessages(
      this.clientId,
      this.id,
      count,
      (status, code, message, messages) => {
        let returnMessages = [];
        if (status) {
          if (isAscending) {
            messages.map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getLastMessages(
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getLastMessages(
      this.clientId,
      this.id,
      count,
      loadDeletedMessage,
      loadDeletedMessageContent,
      (status, code, message, messages) => {
        let returnMessages = [];
        if (status) {
          if (isAscending) {
            messages.map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getAllLastMessages(
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllLastMessages(
      this.clientId,
      this.id,
      count,
      loadDeletedMessage,
      loadDeletedMessageContent,
      (status, code, message, messages) => {
        let returnMessages = [];
        if (status) {
          if (isAscending) {
            messages.map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getMessagesAfter(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getMessagesAfter(
      this.clientId,
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
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getAllMessagesAfter(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllMessagesAfter(
      this.clientId,
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
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getMessagesBefore(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getMessagesBefore(
      this.clientId,
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
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getAllMessagesBefore(
    sequence: number,
    count: number,
    isAscending: boolean,
    loadDeletedMessage: boolean,
    loadDeletedMessageContent: boolean,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.getAllMessagesBefore(
      this.clientId,
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
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          } else {
            messages.reverse().map(msg => {
              msg.clientId = this.clientId;
              returnMessages.push(new Message(msg));
            });
          }
        }
        return callback(status, code, message, returnMessages);
      },
    );
  }

  getMessageById(messageId: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.getMessageById(
      this.clientId,
      this.id,
      messageId,
      (status, code, message, msg) => {
        msg.clientId = this.clientId;
        return callback(status, code, message, new Message(msg));
      },
    );
  }

  endChat(callback: RNStringeeEventCallback) {
    RNStringeeClient.endChat(this.clientId, this.id, callback);
  }
}

export default Conversation;
