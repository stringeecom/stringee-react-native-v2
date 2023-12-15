//
//  RNRoomWrapper.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Foundation/Foundation.h>
#import "RNRoomWrapper.h"
#import "RNStringeeVideoRoom.h"
#import "RCTConvert+StringeeHelper.h"
#import "RNStringeeInstanceManager.h"

@implementation RNRoomWrapper {
    NSMutableSet<NSString *> *jsEvent;
    RNStringeeVideoRoom *rnRoom;
}

- (instancetype)initWithRoom:(StringeeVideoRoom *)room {
    self = [super init];
    if (self) {
        _room = room;
        room.delegate = self;
        jsEvent = [[NSMutableSet alloc] init];
        rnRoom = RNStringeeInstanceManager.instance.rnRoom;
        _videoTrack = [[NSMutableDictionary alloc] init];
        _uuid = [[NSUUID UUID] UUIDString];
        RNStringeeInstanceManager.instance.roomWrappers[_uuid] = self;
    }
    return self;
}

- (void) pushTrack:(StringeeVideoTrack *)track {
    if ([RCTConvert isValid:track.serverId]) {
        [_videoTrack setObject:track forKey:track.serverId];
        return;
    }
    if ([RCTConvert isValid:track.localId]) {
        [_videoTrack setObject:track forKey:track.localId];
        return;
    }
}

- (void)removeNativeEvent:(NSString *)event {
    [jsEvent removeObject:event];
}

- (void)setNativeEvent:(NSString *)event {
    [jsEvent addObject:event];
}


- (void)addTrack:(StringeeVideoRoom *)room trackInfo:(StringeeVideoTrackInfo *)trackInfo { 
    if ([jsEvent containsObject:onAddVideoTrack]) {
        [rnRoom sendEventWithName:onAddVideoTrack body:@{
            @"uuid"   : RCTNullIfNil(_uuid),
            @"data"   : @{
                @"trackInfo": [RCTConvert StringeeVideoTrackInfo:trackInfo]
            }
        }];
    }
}

- (void)joinRoom:(StringeeVideoRoom *)room userInfo:(StringeeRoomUserInfo *)userInfo { 
    if ([jsEvent containsObject:onJoinRoom]) {
        [rnRoom sendEventWithName:onJoinRoom body:@{
            @"uuid"     : RCTNullIfNil(_uuid),
            @"data"     : @{
                @"userInfo" : [RCTConvert StringeeRoomUserInfo:userInfo]
            }
        }];
    }
}

- (void)leaveRoom:(StringeeVideoRoom *)room userInfo:(StringeeRoomUserInfo *)userInfo { 
    if ([jsEvent containsObject:onLeaveRoom]) {
        [rnRoom sendEventWithName:onLeaveRoom body:@{
            @"uuid"   : RCTNullIfNil(_uuid),
            @"data"   : @{
                @"userInfo" : [RCTConvert StringeeRoomUserInfo:userInfo]
            }
        }];
    }
}

- (void)newMessage:(StringeeVideoRoom *)room msg:(NSDictionary *)msg fromUser:(StringeeRoomUserInfo *)fromUser { 
    if ([jsEvent containsObject:onReceiptRoomMessage]) {
        [rnRoom sendEventWithName:onReceiptRoomMessage body:@{
            @"uuid"   : RCTNullIfNil(_uuid),
            @"data"   : @{
                @"fromUser" : [RCTConvert StringeeRoomUserInfo:fromUser],
                @"msg"      : msg
            }
        }];
    }
}

- (void)removeTrack:(StringeeVideoRoom *)room trackInfo:(StringeeVideoTrackInfo *)trackInfo { 
    if ([jsEvent containsObject:onRemoveVideoTrack]) {
        [rnRoom sendEventWithName:onRemoveVideoTrack body:@{
            @"uuid"   : RCTNullIfNil(_uuid),
            @"data"   : @{
                @"trackInfo": [RCTConvert StringeeVideoTrackInfo:trackInfo]
            }
        }];
    }
}


- (void)ready:(StringeeVideoTrack *)track { 
    if ([jsEvent containsObject:onTrackReadyToPlay]) {
        [rnRoom sendEventWithName:onTrackReadyToPlay body:@{
            @"uuid"   : RCTNullIfNil(_uuid),
            @"data"   : @{
                @"track"     : [RCTConvert StringeeVideoTrack:track]
            }
        }];
    }
}

@end
