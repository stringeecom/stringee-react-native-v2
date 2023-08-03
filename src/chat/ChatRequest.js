import type {RNStringeeEventCallback} from '../helpers/StringeeHelper';
import {RNStringeeClient} from '../helpers/StringeeHelper';

class ChatRequest {
  // Request info
  convId: string;
  channelType: number;
  type: number;
  // Customer info
  customerId: string;
  customerName: string;

  constructor(props) {
    this.clientId = props.clientId;
    this.convId = props.convId;
    this.channelType = props.channelType;
    this.type = props.type;
    this.customerId = props.customerId;
    this.customerName = props.customerName;
  }

  acceptChatRequest(callback: RNStringeeEventCallback) {
    RNStringeeClient.acceptChatRequest(this.clientId, this.convId, callback);
  }

  rejectChatRequest(callback: RNStringeeEventCallback) {
    RNStringeeClient.rejectChatRequest(this.clientId, this.convId, callback);
  }
}

export default ChatRequest;
