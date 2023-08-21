import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';
import type {StringeeClient} from '../StringeeClient';

class ChatRequest {
  // Request info
  convId: string;
  channelType: number;
  type: number;
  // Customer info
  customerId: string;
  customerName: string;
  stringeeClient: StringeeClient;

  constructor(props) {
    this.stringeeClient = props.stringeeClient;
    this.convId = props.convId;
    this.channelType = props.channelType;
    this.type = props.type;
    this.customerId = props.customerId;
    this.customerName = props.customerName;
  }

  /**
   * Accept the chat request.
   * @function acceptChatRequest
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  acceptChatRequest(callback: RNStringeeEventCallback) {
    RNStringeeClient.acceptChatRequest(
      this.stringeeClient.uuid,
      this.convId,
      callback,
    );
  }

  /**
   * Reject the chat request.
   * @function rejectChatRequest
   * @param {RNStringeeEventCallback} callback Return the result of function
   */
  rejectChatRequest(callback: RNStringeeEventCallback) {
    RNStringeeClient.rejectChatRequest(
      this.stringeeClient.uuid,
      this.convId,
      callback,
    );
  }
}

export default ChatRequest;
