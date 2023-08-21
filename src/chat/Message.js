import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';
import type {StringeeClient} from '../StringeeClient';

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
  stringeeClient: StringeeClient;
  constructor(props) {
    this.stringeeClient = props.stringeeClient;
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

  /**
   * Pin or unpin the message.
   * @function pinMessage
   * @param {boolean} pin true - pin, false - unpin
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  pinMessage(pin: boolean, callback: RNStringeeEventCallback) {
    RNStringeeClient.pinMessage(
      this.stringeeClient.uuid,
      this.conversationId,
      this.id,
      pin,
      callback,
    );
  }

  /**
   * Edit the message.
   * @function editMessage
   * @param {string} newContent New content of message
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  editMessage(newContent: string, callback: RNStringeeEventCallback) {
    RNStringeeClient.editMessage(
      this.stringeeClient.uuid,
      this.conversationId,
      this.id,
      newContent,
      callback,
    );
  }
}

export default Message;
