type StringeeRoomUserPayload = Record<string, any>;

/** Publisher identity attached to a `StringeeVideoTrack`. */
class StringeeRoomUser {
  userId: string;

  constructor(props: StringeeRoomUserPayload = {}) {
    this.userId = props.userId;
  }
}

export {StringeeRoomUser};
