export class ChatRequest {
    constructor(props?: any);
    convId: string;
    channelType: number;
    type: number;
    customerId: string;
    customerName: string;
    stringeeClient: StringeeClient;
    /**
     * Accept the chat request.
     * @function acceptChatRequest
     */
    acceptChatRequest(): Promise<void>;
    /**
     * Reject the chat request.
     * @function rejectChatRequest
     */
    rejectChatRequest(): Promise<void>;
}
import { StringeeClient } from '../../../index';
