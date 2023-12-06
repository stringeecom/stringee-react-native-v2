import {
  RNStringeeClient,
  normalCallbackHandle,
} from '../helpers/StringeeHelper';
import {StringeeClient} from '../../index';

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
   */
  acceptChatRequest(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.acceptChatRequest(
        this.stringeeClient.uuid,
        this.convId,
        normalCallbackHandle(resolve, reject, 'acceptChatRequest'),
      );
    });
  }

  /**
   * Reject the chat request.
   * @function rejectChatRequest
   */
  rejectChatRequest(): Promise<void> {
    return new Promise((resolve, reject) => {
      RNStringeeClient.rejectChatRequest(
        this.stringeeClient.uuid,
        this.convId,
        normalCallbackHandle(resolve, reject, 'rejectChatRequest'),
      );
    });
  }
}

export {ChatRequest};
