//
//  RNStringeeVideo.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Foundation/Foundation.h>
#import "RNStringeeVideo.h"
#import "RNStringeeInstanceManager.h"
#import "RCTConvert+StringeeHelper.h"
#import "React/RCTLog.h"

@implementation RNStringeeVideo

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(joinRoom:(NSString *)clientUUID roomToken:(NSString *)roomToken callback:(RCTResponseSenderBlock)callback) {
    
    StringeeClient *client = [RNStringeeInstanceManager.instance.clientWrappers objectForKey:clientUUID].client;
    if (client == nil ) {
        callback(@[
            @(false),
            @(-1),
            @"Client is not connected"
        ]);
        return;
    }
    NSLog(@"client: %@ -  %@ - %d",clientUUID, client.userId, client.hasConnected);
    
    if (![RCTConvert isValid:roomToken]) {
        callback(@[
            @(false),
            @(-2),
            @"room token cant not be null or empty"
        ]);
        return;
    }
    
    [StringeeVideo joinRoom:client roomToken:roomToken completion:^(BOOL status, int code, NSString * message, StringeeVideoRoom * room, NSArray<StringeeVideoTrackInfo *> * tracks, NSArray<StringeeRoomUserInfo *> * users) {
        if ([RCTConvert isValid:room.roomId]) {
            RNRoomWrapper *wrapper = [[RNRoomWrapper alloc] initWithRoom:room];
            [RNStringeeInstanceManager.instance.roomWrappers setObject:wrapper forKey:room.roomId];
        }
            callback(@[
                @(status),
                @(code),
                RCTNullIfNil(message),
                [RCTConvert StringeeVideoRoom:room],
                [RCTConvert StringeeVideoTrackInfos:tracks],
                [RCTConvert StringeeRoomUserInfos:users]
            ]);
    }];
}

RCT_EXPORT_METHOD(createLocalVideoTrack:(NSString *)clientUUID roomId:(NSString *)roomId option:(NSDictionary *)option callback:(RCTResponseSenderBlock)callback) {
    StringeeClient *client = [RNStringeeInstanceManager.instance.clientWrappers objectForKey:clientUUID].client;
    if (client == nil || client.hasConnected == false) {
        callback(@[
            @(false),
            @(-1),
            @"Client is not connected"
        ]);
        return;
    }
    RNRoomWrapper *wrapper = [RNStringeeInstanceManager.instance.roomWrappers objectForKey:roomId];
    
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
        return;
    }
    
    StringeeVideoTrackOption *rnOption = [RCTConvert rnInfoDataToTrackOption:option];
    StringeeVideoTrack *track = [StringeeVideo createLocalVideoTrack:client options:rnOption delegate:wrapper];
    [wrapper pushTrack:track];
    callback(@[
        @(true),
        @(0),
        @"Success",
        [RCTConvert StringeeVideoTrack:track]
    ]);
}

RCT_EXPORT_METHOD(releaseRoom: (NSString *)roomId) {
    [RNStringeeInstanceManager.instance.roomWrappers removeObjectForKey:roomId];
}

@end
