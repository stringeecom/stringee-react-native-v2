//
//  RNStringeeVideoRoom.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTLog.h>
#import "RNStringeeVideoRoom.h"
#import "RNStringeeInstanceManager.h"
#import "RCTConvert+StringeeHelper.h"

@implementation RNStringeeVideoRoom

- (instancetype)init
{
    self = [super init];
    if (self) {
        RNStringeeInstanceManager.instance.rnRoom = self;
    }
    return self;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return true;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        onJoinRoom,
        onLeaveRoom,
        onAddVideoTrack,
        onRemoveVideoTrack,
        onReceiptRoomMessage,
        onTrackReadyToPlay
    ];
}

- (RNRoomWrapper *)searchRoomWithId:(NSString *)roomId {
    return [RNStringeeInstanceManager.instance.roomWrappers objectForKey:roomId];
}

RCT_EXPORT_METHOD(setNativeEvent:(NSString *)roomId event:(NSString *)event) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        RCTLog(@"setNativeEvent: -1 wrapper not found");
        return;
    }
    [wrapper setNativeEvent:event];
}

RCT_EXPORT_METHOD(removeNativeEvent:(NSString *)roomId event:(NSString *)event) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        RCTLog(@"setNativeEvent: -1 wrapper not found");
        return;
    }
    [wrapper removeNativeEvent:event];
}

RCT_EXPORT_METHOD(subscribe:(NSString *)roomId trackInfo:(NSDictionary *)trackInfo option:(NSDictionary *)option callback:(RCTResponseSenderBlock)callback) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
    }
    StringeeVideoTrackInfo *rnTrack = [RCTConvert rnInfoDataToTrackInfo:trackInfo];
    StringeeVideoTrackOption *rnOption = [RCTConvert rnInfoDataToTrackOption:option];
    
    [wrapper.room subscribe:rnTrack options:rnOption delegate:wrapper completion:^(BOOL status, int code, NSString *message, StringeeVideoTrack *videoTrack) {
        [wrapper pushTrack:videoTrack];
            callback(@[
                @(status),
                @(code),
                RCTNullIfNil(message),
                [RCTConvert StringeeVideoTrack:videoTrack]
            ]);
    }];
}

RCT_EXPORT_METHOD(publish: (NSString *)roomId track:(NSDictionary *)track callback:(RCTResponseSenderBlock)callback) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
    }
    StringeeVideoTrack *videoTrack = [RCTConvert searchTrackOnRoom:track];
    if (track == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Track is not found"
        ]);
    }
    [wrapper.room publish:videoTrack completion:^(BOOL status, int code, NSString *message) {
        callback(@[
            @(status),
            @(code),
            RCTNullIfNil(message),
        ]);
    }];
}

RCT_EXPORT_METHOD(unpublish: (NSString *)roomId track:(NSDictionary *)track callback:(RCTResponseSenderBlock)callback) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
    }
    StringeeVideoTrack *videoTrack = [RCTConvert searchTrackOnRoom:track];
    if (track == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Track is not found"
        ]);
    }
    [wrapper.room unpublish:videoTrack completion:^(BOOL status, int code, NSString *message) {
        callback(@[
            @(status),
            @(code),
            RCTNullIfNil(message),
        ]);
    }];
}

RCT_EXPORT_METHOD(leave:(NSString *)roomId isLeaveAll:(NSNumber *)isLeaveAll callback:(RCTResponseSenderBlock)callback) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
    }
    
    [wrapper.room leave:[isLeaveAll isEqual: @(1)] completion:^(BOOL status, int code, NSString *message) {
        callback(@[
            @(status),
            @(code),
            RCTNullIfNil(message),
        ]);
    }];
}

RCT_EXPORT_METHOD(sendMessage:(NSString *)roomId msg:(NSDictionary *)msg callback:(RCTResponseSenderBlock)callback) {
    RNRoomWrapper *wrapper = [self searchRoomWithId:roomId];
    if (wrapper == nil) {
        callback(@[
            @(false),
            @(-1),
            @"Room is not found"
        ]);
    }
    [wrapper.room sendMessage:msg completion:^(BOOL status, int code, NSString *message) {
        callback(@[
            @(status),
            @(code),
            RCTNullIfNil(message),
        ]);
    }];
}
@end
