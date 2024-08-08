export class Message {
    constructor(props: any);
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
    /**
     * Pin or unpin the message.
     * @function pinMessage
     * @param {boolean} pin true - pin, false - unpin
     */
    pinMessage(pin: boolean): Promise<void>;
    /**
     * Edit the message.
     * @function editMessage
     * @param {string} newContent New content of message
     */
    editMessage(newContent: string): Promise<void>;
}
import { StringeeClient } from '../../index';
