//
//  RNStringeeVideoTrack.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Foundation/Foundation.h>
#import "RNStringeeVideoTrack.h"
#import "RCTConvert+StringeeHelper.h"
#import "RNRoomWrapper.h"
#import "RNStringeeInstanceManager.h"

const NSString *successMessage = @"Success";
const NSString *faildMessage = @"Faild";

@implementation RNStringeeVideoTrack

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(mute:(NSDictionary *)rnTrack isMute:(nonnull NSNumber *)isMute callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        StringeeVideoTrack *track = [RCTConvert searchTrackOnRoom:rnTrack];
        if (track == nil) {
            callback(@[
                @(false),
                @(-1),
                @"Track is not found"
            ]);
        }
        BOOL response = [track mute:[isMute isEqualToNumber:@(1)]];
        callback(@[
            @(response),
            @(response ? 1 : -1),
            response ? successMessage : faildMessage
        ]);
    });
}

RCT_EXPORT_METHOD(enableVideo:(NSDictionary *)rnTrack isOn:(nonnull NSNumber *)isOn callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        StringeeVideoTrack *track = [RCTConvert searchTrackOnRoom:rnTrack];
        if (track == nil) {
            callback(@[
                @(false),
                @(-1),
                @"Track is not found"
            ]);
        }
        BOOL response = [track enableLocalVideo:[isOn isEqualToNumber:@(1)]];
        callback(@[
            @(response),
            @(response ? 1 : -1),
            response ? successMessage : faildMessage
        ]);
    });
}

RCT_EXPORT_METHOD(switchCamera:(NSDictionary *)rnTrack callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        StringeeVideoTrack *track = [RCTConvert searchTrackOnRoom:rnTrack];
        if (track == nil) {
            callback(@[
                @(false),
                @(-1),
                @"Track is not found"
            ]);
        }
        BOOL response = [track switchCamera];
        callback(@[
            @(response),
            @(response ? 1 : -1),
            response ? successMessage : faildMessage
        ]);
    });
}

RCT_EXPORT_METHOD(release:(NSDictionary *)rnTrack callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *roomId = rnTrack[@"roomId"];
        if ([RCTConvert isValid:roomId]) {
            RNRoomWrapper *wrapper = [RNStringeeInstanceManager.instance.roomWrappers objectForKey: roomId];
            NSString *localId = rnTrack[@"localId"];
            NSString *serverId = rnTrack[@"serverId"];
            
            if ([RCTConvert isValid:localId]) {
                [wrapper.videoTrack removeObjectForKey:localId];
            }
            if ([RCTConvert isValid:serverId]) {
                [wrapper.videoTrack removeObjectForKey:serverId];
            }
            callback(@[
                @(YES),
                @(0),
                successMessage
            ]);

        }else {
            callback(@[
                @(false),
                @(-1),
                @"Only support release track on room"
            ]);
        }
    });
}

@end
