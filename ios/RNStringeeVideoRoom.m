//
//  RNStringeeVideoRoom.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Foundation/Foundation.h>
#import "RNStringeeVideoRoom.h"
#import "RNStringeeInstanceManager.h"

@implementation RNStringeeVideoRoom

- (instancetype)init
{
    self = [super init];
    if (self) {
        RNStringeeInstanceManager.instance.rnRoom = self;
    }
    return self;
}

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

@end
