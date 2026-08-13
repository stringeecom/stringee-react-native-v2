/** Options used when creating a one-to-one or group conversation. */
export class ConversationOption {
  name!: string;
  isDistinct: boolean = true;
  isGroup: boolean = false;

  constructor() {}
}
