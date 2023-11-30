//
//  RNCall2Wrapper.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 20/11/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RNCall2Wrapper.h"
#import "RNStringeeInstanceManager.h"
#import "RCTConvert+StringeeHelper.h"

static NSString *didChangeSignalingState = @"didChangeSignalingState";
static NSString *didChangeMediaState = @"didChangeMediaState";
static NSString *didReceiveLocalStream = @"didReceiveLocalStream";
static NSString *didReceiveRemoteStream = @"didReceiveRemoteStream";

static NSString *didReceiveDtmfDigit = @"didReceiveDtmfDigit";
static NSString *didReceiveCallInfo = @"didReceiveCallInfo";

static NSString *didHandleOnAnotherDevice = @"didHandleOnAnotherDevice";
static NSString *trackMediaStateChange = @"trackMediaStateChange";
static NSString *didAddLocalTrack = @"didAddLocalTrack";
static NSString *didAddRemoteTrack = @"didAddRemoteTrack";

@implementation RNCall2Wrapper {
    NSMutableArray<NSString *> *jsEvents;
    RNStringeeCall2 *rnCall2;
    NSString *clientID;
}

- (instancetype)initWithIdentifier:(NSString *)identifier clientUUID:(NSString *)clientUUID;
{
    self = [super init];
    if (self) {
        jsEvents = [[NSMutableArray alloc] init];
        rnCall2 = RNStringeeInstanceManager.instance.rnCall2;
        clientID = clientUUID;
        _identifier = identifier;
        _videoTrack = [[NSMutableDictionary alloc] init];
    }
    
    return self;
}

- (void)setNativeEvent:(NSString *)event {
    [jsEvents addObject:event];
}

- (void)removeNativeEvent:(NSString *)event {
    int index = -1;
    index = (int)[jsEvents indexOfObject:event];
    if (index >= 0) {
        [jsEvents removeObjectAtIndex:index];
    }
}

- (void)didChangeSignalingState2:(StringeeCall2 *)stringeeCall2
                  signalingState:(SignalingState)signalingState
                          reason:(NSString *)reason
                         sipCode:(int)sipCode
                       sipReason:(NSString *)sipReason {
    if ([jsEvents containsObject:didChangeSignalingState]) {
        [rnCall2 sendEventWithName:didChangeSignalingState
                              body:@{
            @"uuid" : _identifier,
            @"data" : @{
                @"callId" : stringeeCall2.callId,
                @"code" : @(signalingState),
                @"reason" : reason,
                @"sipCode" : @(sipCode),
                @"sipReason" : sipReason,
                @"serial" : @(stringeeCall2.serial)
            }
        }];
    }
    
    // Xoá videoTrack
    if (signalingState == SignalingStateBusy || signalingState == SignalingStateEnded) {
        [[RNStringeeInstanceManager instance].call2VideoTracks removeObjectForKey:stringeeCall2.callId];
    }
}

- (void)didChangeMediaState2:(StringeeCall2 *)stringeeCall2 mediaState:(MediaState)mediaState {
    if ([jsEvents containsObject:didChangeMediaState]) {
        switch (mediaState) {
            case MediaStateConnected:
                [rnCall2
                 sendEventWithName:didChangeMediaState
                 body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall2.callId, @"code" : @(0), @"description" : @"Connected"}}];
                break;
            case MediaStateDisconnected:
                [rnCall2 sendEventWithName:didChangeMediaState
                                      body:@{
                    @"uuid" : _identifier,
                    @"data" : @{@"callId" : stringeeCall2.callId, @"code" : @(1), @"description" : @"Disconnected"}
                }];
                break;
            default:
                break;
        }
    }
}

- (void)didAddTrack2:(StringeeCall2 *)stringeeCall2 track:(StringeeVideoTrack *)track {
    [[RNStringeeInstanceManager instance].call2VideoTracks setObject:track forKey:stringeeCall2.callId];
    if ([jsEvents containsObject:didReceiveRemoteStream]) {
        [rnCall2 sendEventWithName:didReceiveRemoteStream body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall2.callId}}];
    }
}

- (void)didHandleOnAnotherDevice2:(StringeeCall2 *)stringeeCall2
                   signalingState:(SignalingState)signalingState
                           reason:(NSString *)reason
                          sipCode:(int)sipCode
                        sipReason:(NSString *)sipReason {
    if ([jsEvents containsObject:didHandleOnAnotherDevice]) {
        [rnCall2 sendEventWithName:didHandleOnAnotherDevice
                              body:@{
            @"uuid" : _identifier,
            @"data" : @{@"callId" : stringeeCall2.callId, @"code" : @(signalingState), @"description" : reason}
        }];
    }
}

- (void)didReceiveCallInfo2:(StringeeCall2 *)stringeeCall2 info:(NSDictionary *)info {
    if ([jsEvents containsObject:didReceiveCallInfo]) {
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:info options:NSJSONWritingPrettyPrinted error:nil];
        NSString *jsonString = [[[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] stringByReplacingOccurrencesOfString:@" "
                                                                                                                                 withString:@""];
        [rnCall2 sendEventWithName:didReceiveCallInfo body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall2.callId, @"data" : jsonString}}];
    }
}

- (void)trackMediaStateChange:(StringeeCall2 *)stringeeCall2 mediaType:(StringeeTrackMediaType)mediaType enable:(BOOL)enable from:(NSString *)from {
    if ([jsEvents containsObject:trackMediaStateChange]) {
        [rnCall2 sendEventWithName:trackMediaStateChange
                              body:@{@"uuid" : _identifier, @"data" : @{@"from" : from, @"mediaType" : @(mediaType), @"enable" : @(enable)}}];
    }
}

- (void)didAddLocalTrack2:(StringeeCall2 *)stringeeCall2 track:(StringeeVideoTrack *)track {
    if ([RCTConvert isValid:track.serverId]) {
        _videoTrack[track.serverId] = track;
    } else if ([RCTConvert isValid:track.localId]) {
        _videoTrack[track.localId] = track;
    }
    
    if ([jsEvents containsObject:didAddLocalTrack]) {
        [rnCall2 sendEventWithName:didAddLocalTrack
                              body:@{
            @"uuid" : _identifier,
            @"data" : @{
                @"videoTrack" : @{
                    @"localId" : track.localId == nil ? @"" : track.localId,
                    @"serverId" : track.serverId == nil ? @"" : track.serverId,
                    @"isLocal" : @(track.isLocal),
                    @"audio" : @(track.audio),
                    @"video" : @(track.video),
                    @"screen" : @(track.screen),
                    @"trackType" : @(track.trackType),
                    @"publisher" : @{@"userId" : track.publisher.userId}
                }
            }
        }];
    }
}

- (void)didAddRemoteTrack2:(StringeeCall2 *)stringeeCall2 track:(StringeeVideoTrack *)track {
    if ([RCTConvert isValid:track.serverId]) {
        _videoTrack[track.serverId] = track;
    } else if ([RCTConvert isValid:track.localId]) {
        _videoTrack[track.localId] = track;
    }
    
    if ([jsEvents containsObject:didAddRemoteTrack]) {
        [rnCall2 sendEventWithName:didAddRemoteTrack
                              body:@{
            @"uuid" : _identifier,
            @"data" : @{
                @"videoTrack" : @{
                    @"localId" : track.localId == nil ? @"" : track.localId,
                    @"serverId" : track.serverId == nil ? @"" : track.serverId,
                    @"isLocal" : @(track.isLocal),
                    @"audio" : @(track.audio),
                    @"video" : @(track.video),
                    @"screen" : @(track.screen),
                    @"trackType" : @(track.trackType),
                    @"publisher" : @{@"userId" : track.publisher.userId}
                }
            }
        }];
    }
}

- (StringeeClient *)getClient{ 
    return [RNStringeeInstanceManager.instance.clientWrappers objectForKey:clientID].client;
}

@end

