import {
    EmitterSubscription,
    NativeEventEmitter,
    NativeModules,
    Platform,
  } from 'react-native';

import { StringeeClient } from "../..";
import { stringeeRoomEvents } from "../helpers/StringeeHelper";
import StringeeVideoRoomListener from "../listener/StringeeVideoRoomListener";
const RNStringeeVideoRoom = NativeModules.RNStringeeVideoRoom;

export default class StringeeVideoRoom {
    id: string;
    client: StringeeClient;
    recorded: boolean;

    constructor(client: StringeeClient, roomInfo: any) {
        this.client = client;
        this.id = roomInfo.id;
        this.recorded = roomInfo.recorded;

        this.events = [];
        this.subscriptions = [];
        this.eventEmitter = new NativeEventEmitter(RNStringeeVideoRoom);
    }

    setListener = (listener: StringeeVideoRoomListener) {
        if (!listener) { return }
        this.removeEventListener();
        const supportEvents =  Platform.OS === 'ios' ? stringeeRoomEvents.ios : stringeeRoomEvents.android;

    }

    removeEventListener() {
        if (this.events.length === 0 && this.subscriptions.length === 0) {
            return;
        }
        this.subscriptions.forEach(e => e.remove());
        this.subscriptions = [];
        this.events.forEach(e => RNStringeeCall.removeNativeEvent(this.uuid, e));
        this.events = [];
    }
}