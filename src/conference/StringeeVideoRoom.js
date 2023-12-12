import {
    EmitterSubscription,
    NativeEventEmitter,
    NativeModules,
    Platform,
  } from 'react-native';

import { StringeeClient, StringeeError, StringeeRoomUser, StringeeVideoTrack } from "../..";
import { normalCallbackHandle, stringeeRoomEvents } from "../helpers/StringeeHelper";
import StringeeVideoRoomListener from "../listener/StringeeVideoRoomListener";
import StringeeVideoTrackInfo from './StringeeVideoTrackInfo';
import StringeeVideoTrackOption from './StringeeVideoTrackOption';
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
    setListener = (listener: StringeeVideoRoomListener) => {
        if (!listener) { return }
        this.removeEventListener();
        const supportEvents =  Platform.OS === 'ios' ? stringeeRoomEvents.ios : stringeeRoomEvents.android;
        supportEvents.forEach(event => {
            if (listener[event]) {
                let emitterSubscription: EmitterSubscription = this.eventEmitter.addListener(
                    event,
                    ({roomId, data}) => {
                        if (roomId !== this.id) { return }
                        switch(event) {
                            case 'onJoinRoom':
                                listener.onJoinRoom(this, new StringeeRoomUser(data.userInfo));
                                break;
                            case 'onLeaveRoom':
                                listener.onLeaveRoom(this, new StringeeRoomUser(data.userInfo));
                                break;
                            case 'onAddVideoTrack':
                                listener.onAddVideoTrack(this, new StringeeVideoTrackInfo(data.trackInfo));
                                break;
                            case 'onRemoveVideoTrack':
                                listener.onRemoveVideoTrack(this, new StringeeVideoTrackInfo(data.trackInfo));
                                break;
                            case 'onReceiptRoomMessage':
                                listener.onReceiptRoomMessage(this, new StringeeRoomUser(data.fromUser), data.msg);
                                break;
                            case 'onTrackReadyToPlay':
                                let track = new StringeeVideoTrack(data.track);
                                track.roomId = this.id;
                                listener.onTrackReadyToPlay(this, track)
                                break;
                            case 'onTrackMediaStateChange':
                                listener.onTrackMediaStateChange(
                                    this,
                                    data.mediaType === 1 ? 'audio' : 'video',
                                    data.enable,
                                    data.from,
                                    new StringeeVideoTrackInfo(data.trackInfo)
                                )
                                break;
                            default:
                                break;
                        }
                        this.subscriptions.push(emitterSubscription);
                        this.events.push(event);
                        RNStringeeVideoRoom.setNativeEvent(this.id, event);

                    }
                )
            }
        })

    }

    removeEventListener() {
        if (this.events.length === 0 && this.subscriptions.length === 0) {
            return;
        }
        this.subscriptions.forEach(e => e.remove());
        this.subscriptions = [];
        this.events.forEach(e => RNStringeeVideoRoom.removeNativeEvent(this.uuid, e));
        this.events = [];
    }

    publish = (track: StringeeVideoTrack): Promise<void> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.publish(this.id, track, normalCallbackHandle (resolve, reject, 'publish'));
    })

    unpublish = (track: StringeeVideoTrack): Promise<void> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.unpublish(this.id, track, normalCallbackHandle (resolve, reject, 'unpublish'));
    })

    subscribe = (trackInfo: StringeeVideoTrackInfo, option: StringeeVideoTrackOption): Promise<StringeeVideoTrack> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.subscribe(this.id, trackInfo, option, (status, code, message, track) => {
            if (status) {
                let response = new StringeeVideoTrack(track);
                response.roomId = roomId;
                resolve(response);
            } else {
                reject(new StringeeError(code, message, 'subscribe'));
            }
        }); 
    })

    unsubscribe = (track: StringeeVideoTrack): Promise<void> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.unsubscribe(this.id, track, normalCallbackHandle(resolve, reject, 'unsubscribe'));
    })

    leave = (isLeaveAll: boolean): Promise<void> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.leave(this.id,isLeaveAll, normalCallbackHandle(resolve, reject, 'leave'));
    })

    sendMessage = (msg: any): Promise<void> => new Promise((resolve, reject) => {
        RNStringeeVideoRoom.sendMessage(this.id, msg, normalCallbackHandle(resolve, reject, 'sendMessage'));
    })
}