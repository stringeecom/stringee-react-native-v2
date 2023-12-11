//
//  RNStringeeVideoRoom.h
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//


#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

static NSString *const onJoinRoom = @"onJoinRoom";
static NSString *const onLeaveRoom = @"onLeaveRoom";
static NSString *const onAddVideoTrack = @"onAddVideoTrack";
static NSString *const onRemoveVideoTrack = @"onRemoveVideoTrack";
static NSString *const onReceiptRoomMessage = @"onReceiptRoomMessage";
static NSString *const onTrackReadyToPlay = @"onTrackReadyToPlay";

@interface RNStringeeVideoRoom : RCTEventEmitter <RCTBridgeModule>

@end
