import {
    NativeModules,
} from 'react-native';

import { StringeeClient } from "../StringeeClient";
import { StringeeError } from "../helpers/StringeeError";
import { StringeeVideoTrack } from "../video/StringeeVideoTrack";
import StringeeVideoRoom from "./StringeeVideoRoom";
import StringeeVideoTrackOption from "./StringeeVideoTrackOption";

const RNStrigneeVideo = NativeModules.RNStrigneeVideo;

const joinRoom = (client: StringeeClient, roomToken: string): Promise<any> => new Promise((resolve, reject) => {
    RNStrigneeVideo.joinRoom(client.uuid, roomToken, (status, code, message, data) => {
        if (status) {
            resolve(data);
        } else {
            reject(new StringeeError(code, message, 'joinRoom'));
        }
    })
})

const createLocalVideoTrack = (client: StringeeClient,room: StringeeVideoRoom , option: StringeeVideoTrackOption): Promise<StringeeVideoTrack> => new Promise((resolve, reject) => {
    RNStrigneeVideo.createLocalVideoTrack(client.uuid, room.id, option, (status, code, message, data) => {
        if (status) {
            resolve(new StringeeVideoTrack(data));
        } else {
            reject(new StringeeError(code, message, 'createLocalVideoTrack'));
        }
    })
})

const releaseRoom = (videoRoom: StringeeVideoRoom): void => {
    RNStrigneeVideo.releaseRoom(videoRoom.id);
}

export default {
    joinRoom,
    createLocalVideoTrack,
    releaseRoom
}