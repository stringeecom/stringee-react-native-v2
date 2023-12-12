import {
    EmitterSubscription,
    NativeEventEmitter,
    NativeModules,
    Platform,
  } from 'react-native';

import { StringeeClient } from "../StringeeClient";
import { StringeeError } from "../helpers/StringeeError";
import { StringeeVideoTrack } from "../video/StringeeVideoTrack";
import StringeeVideoRoom from "./StringeeVideoRoom";
import StringeeVideoTrackOption from "./StringeeVideoTrackOption";
import StringeeVideoTrackInfo from './StringeeVideoTrackInfo';
import { StringeeRoomUser } from '../video/StringeeRoomUser';

const RNStrigneeVideo = NativeModules.RNStringeeVideo;

export const joinRoom = (client: StringeeClient, roomToken: string): Promise<any> => new Promise((resolve, reject) => {
    RNStrigneeVideo.joinRoom(client.uuid, roomToken, (status, code, message,room, tracks, users) => {
        if (status) {
            resolve(
                {
                    room: new StringeeVideoRoom(room),
                    tracks: tracks.map(item => {return new StringeeVideoTrackInfo(item)}),
                    users:  users.map(item => {return new StringeeRoomUser(item)})
                }               
            )
        } else {
            reject(new StringeeError(code, message, 'joinRoom'));
        }
    })
})

export const createLocalVideoTrack = (room: StringeeVideoRoom , option: StringeeVideoTrackOption): Promise<StringeeVideoTrack> => new Promise((resolve, reject) => {
    RNStrigneeVideo.createLocalVideoTrack(room.client.uuid, room.id, option, (status, code, message, data) => {
        if (status) {
            resolve(new StringeeVideoTrack(data));
        } else {
            reject(new StringeeError(code, message, 'createLocalVideoTrack'));
        }
    })
})

export const releaseRoom = (videoRoom: StringeeVideoRoom): void => {
    RNStrigneeVideo.releaseRoom(videoRoom.id);
}