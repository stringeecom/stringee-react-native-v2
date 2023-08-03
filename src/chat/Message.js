import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';

class Message {
  localId: string;
  id: string;
  conversationId: string;
  sender: string;
  createdAt: number;
  state: number;
  sequence: number;
  type: number;
  content: string;
  constructor(props) {
    this.clientId = props.clientId;
    this.localId = props.localId;
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.sender = props.sender;
    this.createdAt = props.createdAt;
    this.state = props.state;
    this.sequence = props.sequence;
    this.type = props.type;
    this.content = props.content;
  }

  pinMessage(pin: boolean, callback: RNStringeeEventCallback) {
    RNStringeeClient.pinMessage(
      this.clientId,
      this.conversationId,
      this.id,
      pin,
      callback,
    );
  }

  editMessage(
    convId: string,
    messageId: string,
    newContent: string,
    callback: RNStringeeEventCallback,
  ) {
    RNStringeeClient.editMessage(
      this.clientId,
      this.conversationId,
      this.id,
      newContent,
      callback,
    );
  }
}

export default Message;
