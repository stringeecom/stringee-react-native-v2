export enum MediaType {
  audio = "audio",
  video = "video",
}

export enum StringeeVideoScalingType {
  fit = "fit",
  fill = "fill",
}

export enum ObjectType {
  conversation = "conversation",
  message = "message",
}

export enum ChangeType {
  insert = "insert",
  update = "update",
  delete = "delete",
}

export enum SignalingState {
  calling = "calling",
  ringing = "ringing",
  answered = "answered",
  busy = "busy",
  ended = "ended",
}

export enum MediaState {
  connected = "connected",
  disconnected = "disconnected",
}

export enum AudioDevice {
  speakerPhone = "speakerPhone",
  wiredHeadset = "wiredHeadset",
  earpiece = "earpiece",
  bluetooth = "bluetooth",
  none = "none",
}

export enum VideoResolution {
  normal = "NORMAL",
  hd = "HD",
}

export enum CallType {
  appToAppOutgoing = "appToAppOutgoing",
  appToAppIncoming = "appToAppIncoming",
  appToPhone = "appToPhone",
  phoneToApp = "phoneToApp",
}

export enum TrackType {
  camera = "camera",
  screen = "screen",
  player = "player",
}
