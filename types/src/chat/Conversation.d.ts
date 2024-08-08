export class Conversation {
    constructor(props: any);
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
    /**
     * Delete the conversation
     * @function deleteConversation
     */
    deleteConversation(): Promise<void>;
    /**
     * Add participants to the conversation.
     * @function addParticipants
     * @param {Array<string>} userIds List of user's ids
     */
    addParticipants(userIds: Array<string>): Promise<Array<User>>;
    /**
     * Remove participants from the conversation.
     * @function removeParticipants
     * @param {Array<string>} userIds List of user's ids
     */
    removeParticipants(userIds: Array<string>): Promise<Array<User>>;
    /**
     * Update the conversation's information.
     * @function updateConversation
     * @param {ConversationInfo} conversationInfo New information of the conversation
     */
    updateConversation(conversationInfo: ConversationInfo): Promise<void>;
    /**
     * Mark the conversation as read.
     * @function markConversationAsRead
     */
    markConversationAsRead(): Promise<void>;
    /**
     * Send begin typing event to other client.
     * @function sendBeginTyping
     */
    sendBeginTyping(): Promise<void>;
    /**
     * Send end typing event to other client.
     * @function sendEndTyping
     */
    sendEndTyping(): Promise<void>;
    /**
     * Send the message.
     * @function sendMessage
     * @param {NewMessageInfo} newMessageInfo Message to send
     */
    sendMessage(newMessageInfo: NewMessageInfo): Promise<void>;
    /**
     * Delete the message.
     * @function deleteMessage
     * @param {string} messageId Message's id to delete
     */
    deleteMessage(messageId: string): Promise<void>;
    /**
     * Revoke the message.
     * @function revokeMessage
     * @param {string} messageId Message's id to revoke
     */
    revokeMessage(messageId: string): Promise<void>;
    /**
     * Get messages of the conversation saved in your local database.
     * @function getLocalMessages
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     */
    getLocalMessages(count: number, isAscending: boolean): Promise<Array<Message>>;
    /**
     * Get the latest message of the conversation from the Stringee server.
     * @function getLastMessages
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getLastMessages(count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get the latest message include deleted message of the conversation from the Stringee server.
     * @function getAllLastMessages
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getAllLastMessages(count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get a list of messages of conversation with sequence greater than 'sequence' from the Stringee server.
     * @function getMessagesAfter
     * @param {number} sequence Sequence of message
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getMessagesAfter(sequence: number, count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get a list of messages include deleted message of conversation with sequence greater than 'sequence' from the Stringee server.
     * @function getAllMessagesAfter
     * @param {number} sequence Sequence of message
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getAllMessagesAfter(sequence: number, count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get a list of messages of conversation with sequence smaller than 'sequence' from the Stringee server.
     * @function getMessagesBefore
     * @param {number} sequence Sequence of message
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getMessagesBefore(sequence: number, count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get a list of messages include deleted message of conversation with sequence smaller than 'sequence' from the Stringee server.
     * @function getAllMessagesBefore
     * @param {number} sequence Sequence of message
     * @param {string} count Number of messages
     * @param {boolean} isAscending Sort order true: ascending, false: descending
     * @param {boolean} loadDeletedMessage Load include deleted message true: Load include deleted message, false: Load not include deleted message
     * @param {boolean} loadDeletedMessageContent Load include deleted message true: Load include deleted message content, false: Load not include deleted message content
     */
    getAllMessagesBefore(sequence: number, count: number, isAscending: boolean, loadDeletedMessage: boolean, loadDeletedMessageContent: boolean): Promise<Array<Message>>;
    /**
     * Get the existing message with given id.
     * @function getMessageById
     * @param {string} messageId Message's id
     */
    getMessageById(messageId: string): Promise<Message>;
    /**
     * End the support conversation
     * @function endChat
     */
    endChat(): Promise<void>;
    /**
     * Send chat's content to an email at any time.
     * @function sendChatTranscript
     * @param {string} email Email receive
     * @param {string} domain Stringee will send an email with "stringee" domain for default, you can change this by pass domain parameter with any string that you want.
     */
    sendChatTranscript(email: string, domain: string): Promise<any>;
}
import { User } from '../../index';
import { Message } from '../../index';
import { StringeeClient } from '../../index';
import { ConversationInfo } from '../../index';
import { NewMessageInfo } from '../../index';
