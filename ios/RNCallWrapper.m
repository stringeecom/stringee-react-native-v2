//
//  RNStringeeCallWrapper.m
//  RNStringee
//
//  Created by Hiệp Hoàng on 20/11/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTConvert+StringeeHelper.h"
#import "RNCallWrapper.h"
#import "RNStringeeInstanceManager.h"

static NSString *didChangeSignalingState = @"didChangeSignalingState";
static NSString *didChangeMediaState = @"didChangeMediaState";
static NSString *didReceiveLocalStream = @"didReceiveLocalStream";
static NSString *didReceiveRemoteStream = @"didReceiveRemoteStream";

static NSString *didReceiveDtmfDigit = @"didReceiveDtmfDigit";
static NSString *didReceiveCallInfo = @"didReceiveCallInfo";
static NSString *didHandleOnAnotherDevice = @"didHandleOnAnotherDevice";

@implementation RNCallWrapper {
    NSMutableArray<NSString *> *jsEvents;
    RNStringeeCall *rnCall;
    NSString *clientID;
}

- (instancetype)initWithIdentifier:(NSString *)identifier clientUUID:(NSString *)clientUUID;
{
    self = [super init];
    if (self) {
        jsEvents = [[NSMutableArray alloc] init];
        rnCall = RNStringeeInstanceManager.instance.rnCall;
        clientID = clientUUID;
        _identifier = identifier;
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

- (void)didChangeMediaState:(StringeeCall *)stringeeCall mediaState:(MediaState)mediaState {
    if ([jsEvents containsObject:didChangeMediaState]) {
        switch (mediaState) {
            case MediaStateConnected:
                [RNStringeeInstanceManager.instance.rnCall
                 sendEventWithName:didChangeMediaState
                 body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall.callId, @"code" : @(0), @"description" : @"Connected"}}];
                break;
            case MediaStateDisconnected:
                [RNStringeeInstanceManager.instance.rnCall
                 sendEventWithName:didChangeMediaState
                 body:@{
                    @"uuid" : _identifier,
                    @"data" : @{@"callId" : stringeeCall.callId, @"code" : @(1), @"description" : @"Disconnected"}
                }];
                break;
            default:
                break;
        }
    }
}

- (void)didChangeSignalingState:(StringeeCall *)stringeeCall
                 signalingState:(SignalingState)signalingState
                         reason:(NSString *)reason
                        sipCode:(int)sipCode
                      sipReason:(NSString *)sipReason {
    if ([jsEvents containsObject:didChangeSignalingState]) {
        [RNStringeeInstanceManager.instance.rnCall sendEventWithName:didChangeSignalingState
                                                                body:@{
            @"uuid" : _identifier,
            @"data" : @{
                @"callId" : stringeeCall.callId,
                @"code" : @(signalingState),
                @"reason" : reason,
                @"sipCode" : @(sipCode),
                @"sipReason" : sipReason,
                @"serial" : @(stringeeCall.serial)
            }
        }];
    }
}

- (void)didReceiveLocalStream:(StringeeCall *)stringeeCall {
    if ([jsEvents containsObject:didReceiveLocalStream]) {
        [rnCall sendEventWithName:didReceiveLocalStream body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall.callId}}];
    }
}

- (void)didReceiveRemoteStream:(StringeeCall *)stringeeCall {
    if ([jsEvents containsObject:didReceiveRemoteStream]) {
        [rnCall sendEventWithName:didReceiveRemoteStream body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall.callId}}];
    }
}
- (void)didReceiveDtmfDigit:(StringeeCall *)stringeeCall callDTMF:(CallDTMF)callDTMF {
    if ([jsEvents containsObject:didReceiveDtmfDigit]) {
        NSString *digit = @"";
        if ((long)callDTMF <= 9) {
            digit = [NSString stringWithFormat:@"%ld", (long)callDTMF];
        } else if (callDTMF == 10) {
            digit = @"*";
        } else if (callDTMF == 11) {
            digit = @"#";
        }
        
        [rnCall sendEventWithName:didReceiveDtmfDigit body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall.callId, @"dtmf" : digit}}];
    }
}

- (void)didReceiveCallInfo:(StringeeCall *)stringeeCall info:(NSDictionary *)info {
    if ([jsEvents containsObject:didReceiveCallInfo]) {
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:info options:NSJSONWritingPrettyPrinted error:nil];
        NSString *jsonString = [[[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] stringByReplacingOccurrencesOfString:@" "
                                                                                                                                 withString:@""];
        [rnCall sendEventWithName:didReceiveCallInfo body:@{@"uuid" : _identifier, @"data" : @{@"callId" : stringeeCall.callId, @"data" : jsonString}}];
    }
}
- (void)didHandleOnAnotherDevice:(StringeeCall *)stringeeCall
                  signalingState:(SignalingState)signalingState
                          reason:(NSString *)reason
                         sipCode:(int)sipCode
                       sipReason:(NSString *)sipReason {
    if ([jsEvents containsObject:didHandleOnAnotherDevice]) {
        [rnCall sendEventWithName:didHandleOnAnotherDevice
                             body:@{
            @"uuid" : _identifier,
            @"data" : @{@"callId" : stringeeCall.callId, @"code" : @(signalingState), @"description" : reason}
        }];
    }
}

- (StringeeClient *)getClient;
{ return [RNStringeeInstanceManager.instance.clientWrappers objectForKey:clientID].client; }

@end

