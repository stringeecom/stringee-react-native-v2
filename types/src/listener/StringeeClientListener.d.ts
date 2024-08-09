export class StringeeClientListener {
  /**
   * Invoked when the client connects to Stringee server.
   * @function onConnect
   * @param {StringeeClient} stringeeClient
   * @param {string} userId The unique identification of the client on Stringee system
   */
  onConnect: (stringeeClient: StringeeClient, userId: string) => void;
  /**
   * Invoked when the client connects to Stringee server.
   * @function onDisConnect
   * @param {StringeeClient} stringeeClient
   */
  onDisConnect: (stringeeClient: StringeeClient) => void;
  /**
   * Invoked when the client fails to connect to Stringee server.
   * @function onFailWithError
   * @param {StringeeClient} stringeeClient
   * @param {number} code
   * @param {string} message
   */
  onFailWithError: (stringeeClient: StringeeClient, code: number, message: string) => void;
  /**
   * Invoked when the access token is expired. You must get a new token and reconnect.
   * @function onRequestAccessToken
   * @param {StringeeClient} stringeeClient
   */
  onRequestAccessToken: (stringeeClient: StringeeClient) => void;
  /**
   * Invoked when the client receives an incoming call.
   * @function onIncomingCall
   * @param {StringeeClient} stringeeClient
   * @param {StringeeCall} stringeeCall The incoming call
   */
  onIncomingCall: (stringeeClient: StringeeClient, stringeeCall: StringeeCall) => void;
  /**
   * Invoked when the client receives an incoming call2.
   * @function onIncomingCall2
   * @param {StringeeClient} stringeeClient
   * @param {StringeeCall} stringeeCall The incoming call2
   */
  onIncomingCall2: (stringeeClient: StringeeClient, stringeeCall2: StringeeCall2) => void;
  /**
   * Invoked when the client get custom message.
   * @function onCustomMessage
   * @param {StringeeClient} stringeeClient
   * @param {string} from Sender's id
   * @param {Object} data Data of custom message.
   */
  onCustomMessage: (stringeeClient: StringeeClient, from: string, data: {}) => void;
  /**
   * Invoked when the client receives an object change of chat.
   * @function onObjectChange
   * @param {StringeeClient} stringeeClient
   * @param {ObjectType} objectType The type of updated object
   * @param {Array} objectChanges A set of updated objects
   * @param {ChangeType} changeType The type of change
   */
  onObjectChange: (stringeeClient: StringeeClient, objectType: ObjectType, objectChanges: Array<Object>, changeType: ChangeType) => void;
  /**
   * Invoked when the client receives chat request.
   * @function onReceiveChatRequest
   * @param {StringeeClient} stringeeClient
   * @param {ChatRequest} chatRequest Incoming chat request
   */
  onReceiveChatRequest: (stringeeClient: StringeeClient, chatRequest: ChatRequest) => void;
  /**
   * Invoked when the client receives transfer chat request.
   * @function onReceiveTransferChatRequest
   * @param {StringeeClient} stringeeClient
   * @param {ChatRequest} chatRequest Incoming chat request
   */
  onReceiveTransferChatRequest: (stringeeClient: StringeeClient, chatRequest: ChatRequest) => void;
  /**
   * Invoked when a chat request time out for answer and route to next agent.
   * @function onTimeoutAnswerChat
   * @param {StringeeClient} stringeeClient
   * @param {ChatRequest} chatRequest Chat request timed out
   */
  onTimeoutAnswerChat: (stringeeClient: StringeeClient, chatRequest: ChatRequest) => void;
  /**
   * Invoked when a chat request timed out and no agent in queue accept.
   * @function onTimeoutInQueue
   * @param {StringeeClient} stringeeClient
   * @param {string} convId Conversation's id
   * @param {string} customerId Customer's id
   * @param {string} customerName Customer's name
   */
  onTimeoutInQueue: (stringeeClient: StringeeClient, convId: string, customerId: string, customerName: string) => void;
  /**
   * Invoked when the conversation is ended.
   * @function onConversationEnded
   * @param {StringeeClient} stringeeClient
   * @param {string} convId Ended conversation's id
   * @param {string} endedBy Id of the user who ends the conversation
   */
  onConversationEnded: (stringeeClient: StringeeClient, convId: string, endedBy: string) => void;
  /**
   * Invoked when the user sends event begin typing.
   * @function onUserBeginTyping
   * @param {StringeeClient} stringeeClient
   * @param {string} convId Id of conversation which user send event in
   * @param {string} userId Id of the user who send event
   * @param {string} displayName Name of the user who send event
   */
  onUserBeginTyping: (stringeeClient: StringeeClient, convId: string, userId: string, displayName: string) => void;
  /**
   * Invoked when the user sends event end typing.
   * @function onUserEndTyping
   * @param {StringeeClient} stringeeClient
   * @param {string} convId Id of conversation which user send in
   * @param {string} userId Id of the user who send event
   * @param {string} displayName Name of the user who send event
   */
  onUserEndTyping: (stringeeClient: StringeeClient, convId: string, userId: string, displayName: string) => void;
}

import { ChangeType, ChatRequest, ObjectType, StringeeCall, StringeeCall2, StringeeClient } from "../../../index";
