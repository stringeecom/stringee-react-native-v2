import {
  RNStringeeClient,
  normalCallbackHandle,
} from '../helpers/StringeeHelper';
import {StringeeClient} from '../../index';

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
   */
  pinMessage(pin: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.pinMessage(
        this.stringeeClient.uuid,
        this.conversationId,
        this.id,
        pin,
        normalCallbackHandle(resolve, reject, 'pinMessage'),
      );
    });
  }

  /**
   * Edit the message.
   * @function editMessage
   * @param {string} newContent New content of message
   */
  editMessage(newContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.editMessage(
        this.stringeeClient.uuid,
        this.conversationId,
        this.id,
        newContent,
        normalCallbackHandle(resolve, reject, 'editMessage'),
      );
    });
  }
}

export {Message};
