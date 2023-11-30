
#import "RNStringeeCall2.h"
#import "RNStringeeInstanceManager.h"
#import "RNCall2Wrapper.h"
#import <React/RCTLog.h>

static NSString *didChangeSignalingState    = @"didChangeSignalingState";
static NSString *didChangeMediaState        = @"didChangeMediaState";
static NSString *didReceiveLocalStream      = @"didReceiveLocalStream";
static NSString *didReceiveRemoteStream     = @"didReceiveRemoteStream";

static NSString *didReceiveDtmfDigit        = @"didReceiveDtmfDigit";
static NSString *didReceiveCallInfo         = @"didReceiveCallInfo";

static NSString *didHandleOnAnotherDevice   = @"didHandleOnAnotherDevice";
static NSString *trackMediaStateChange      = @"trackMediaStateChange";

static NSString *didAddLocalTrack           = @"didAddLocalTrack";
static NSString *didAddRemoteTrack         = @"didAddRemoteTrack";


@implementation RNStringeeCall2
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        [RNStringeeInstanceManager instance].rnCall2 = self;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[didChangeSignalingState,
             didChangeMediaState,
             didReceiveLocalStream,
             didReceiveRemoteStream,
             didReceiveDtmfDigit,
             didReceiveCallInfo,
             didHandleOnAnotherDevice,
             trackMediaStateChange,
             didAddLocalTrack,
             didAddRemoteTrack
             ];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

// TODO: - Publish Functions

RCT_EXPORT_METHOD(createWrapper:(NSString *)uuid clientUUID:(NSString *)clientUUID) {
    RNCall2Wrapper *wrapper = [[RNCall2Wrapper alloc] initWithIdentifier:uuid clientUUID:clientUUID];
    [RNStringeeInstanceManager.instance.call2Wrappers setObject:wrapper forKey:uuid];
}

RCT_EXPORT_METHOD(clean:(NSString *)uuid) {
    RNStringeeInstanceManager.instance.call2Wrappers[uuid] = nil;
}

RCT_EXPORT_METHOD(setNativeEvent:(NSString *)uuid event:(NSString *)event) {
    RNCall2Wrapper *callWrapper = [RNStringeeInstanceManager.instance.call2Wrappers objectForKey:uuid];
    if (callWrapper == nil) {
        RCTLog(@"setNativeEvent: -1 wrapper not found");
        return;
    }
    [callWrapper setNativeEvent:event];
}

RCT_EXPORT_METHOD(removeNativeEvent:(NSString *)uuid event:(NSString *)event) {
    RNCall2Wrapper *callWrapper = [RNStringeeInstanceManager.instance.call2Wrappers objectForKey:uuid];
    if (callWrapper == nil) {
        RCTLog(@"removeNativeEvent: -1 wrapper not found");
        return;
    }
    [callWrapper removeNativeEvent:event];
}

RCT_EXPORT_METHOD(makeCall:(NSString *)uuid parameters:(NSString *)parameters callback:(RCTResponseSenderBlock)callback) {

    NSError *jsonError;
    NSData *objectData = [parameters dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *data = [NSJSONSerialization JSONObjectWithData:objectData
                                      options:NSJSONReadingMutableContainers
                                        error:&jsonError];
    if (jsonError) {
        callback(@[@(NO), @(-4), @"The parameters format is invalid.", [NSNull null], [NSNull null]]);
    } else {
        NSString *from = data[@"from"];
        NSString *to = data[@"to"];
        NSNumber *isVideoCall = data[@"isVideoCall"];
        NSString *customData = data[@"customData"];
        NSString *videoResolution = data[@"videoResolution"];
        
        RNCall2Wrapper *wrapper = [RNStringeeInstanceManager.instance.call2Wrappers objectForKey:uuid];
        if (wrapper == nil) {
            callback(@[@(NO), @(-1), @"Wrapper is not found", [NSNull null], [NSNull null]]);
            return;
        }
        
        StringeeClient *client = [wrapper getClient];
        
        if (!client) {
            callback(@[@(NO), @(-1), @"StringeeClient is not initialized", [NSNull null], [NSNull null]]);
            return;
        }

        StringeeCall2 *outgoingCall = [[StringeeCall2 alloc] initWithStringeeClient:client from:from to:to];
        wrapper.call = outgoingCall;
        outgoingCall.delegate = wrapper;
        outgoingCall.isVideoCall = [isVideoCall boolValue];

        if (customData.length) {
            outgoingCall.customData = customData;
        }

        if ([videoResolution isEqualToString:@"NORMAL"]) {
            outgoingCall.videoResolution = VideoResolution_Normal;
        } else if ([videoResolution isEqualToString:@"HD"]) {
            outgoingCall.videoResolution = VideoResolution_HD;
        }

        [outgoingCall makeCallWithCompletionHandler:^(BOOL status, int code, NSString *message, NSString *data) {
            id returnData = data ? data : [NSNull null];
            callback(@[@(status), @(code), message, outgoingCall.callId, returnData]);
        }];
    }
}

RCT_EXPORT_METHOD(initAnswer:(NSString *)uuid callback:(RCTResponseSenderBlock)callback) {
    RNCall2Wrapper *wrapper = [RNStringeeInstanceManager.instance.call2Wrappers objectForKey:uuid];
    if (wrapper == nil) {
        callback(@[@(NO), @(-1), @"Wrapper is not found", [NSNull null], [NSNull null]]);
        return;
    }
    
    StringeeClient *client = [wrapper getClient];
    
    if (client && client.hasConnected) {
        StringeeCall2 *call = wrapper.call;
        if (call) {
            [call initAnswerCall];
            callback(@[@(YES), @(0), @"Init answer call successfully."]);
        } else {
            callback(@[@(NO), @(-3), @"Init answer call failed. The call is not found."]);
        }
    } else {
        callback(@[@(NO), @(-1), @"StringeeClient is not initialzied or connected."]);
    }
}

RCT_EXPORT_METHOD(answer:(NSString *)uuid callback:(RCTResponseSenderBlock)callback) {
    if (uuid.length) {
        StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;
        if (call) {
            [call answerCallWithCompletionHandler:^(BOOL status, int code, NSString *message) {
                callback(@[@(status), @(code), message]);
            }];
        } else {
            callback(@[@(NO), @(-3), @"Answer call failed. The call is not found."]);
        }
    } else {
        callback(@[@(NO), @(-2), @"Answer call failed. The uuid is invalid."]);
    }
}

RCT_EXPORT_METHOD(hangup:(NSString *)uuid callback:(RCTResponseSenderBlock)callback) {
    if (uuid.length) {
        StringeeCall2 *call =[[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;
        if (call) {
            [call hangupWithCompletionHandler:^(BOOL status, int code, NSString *message) {
                callback(@[@(status), @(code), message]);
            }];
        } else {
            callback(@[@(NO), @(-3), @"Hangup call failed. The call is not found."]);
        }
        
    } else {
        callback(@[@(NO), @(-2), @"Hangup call failed. The uuid is invalid."]);
    }
}

RCT_EXPORT_METHOD(reject:(NSString *)uuid callback:(RCTResponseSenderBlock)callback) {
    if (uuid.length) {
        StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;
        if (call) {
            [call rejectWithCompletionHandler:^(BOOL status, int code, NSString *message) {
                callback(@[@(status), @(code), message]);
            }];
        } else {
            callback(@[@(NO), @(-3), @"Reject call failed. The call is not found."]);
        }
    } else {
        callback(@[@(NO), @(-2), @"Reject call failed. The uuid is invalid."]);
    }
}

RCT_EXPORT_METHOD(mute:(NSString *)uuid mute:(BOOL)mute callback:(RCTResponseSenderBlock)callback) {

    if (!uuid.length) {
        callback(@[@(NO), @(-2), @"The uuid is invalid."]);
        return;
    }

    StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;

    if (!call) {
        callback(@[@(NO), @(-3), @"The call is not found."]);
        return;
    }

    [call mute:mute];
    callback(@[@(YES), @(0), @"Success"]);

}

RCT_EXPORT_METHOD(setSpeakerphoneOn:(NSString *)uuid speaker:(BOOL)speaker callback:(RCTResponseSenderBlock)callback) {

    if (!uuid.length) {
        callback(@[@(NO), @(-2), @"The uuid is invalid."]);
        return;
    }

    StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;

    if (!call) {
        callback(@[@(NO), @(-3), @"The call is not found."]);
        return;
    }

    [[StringeeAudioManager instance] setLoudspeaker:speaker];
    callback(@[@(YES), @(0), @"Success"]);
}

RCT_EXPORT_METHOD(switchCamera:(NSString *)uuid callback:(RCTResponseSenderBlock)callback) {

    if (!uuid.length) {
        callback(@[@(NO), @(-2), @"The uuid is invalid."]);
        return;
    }

    StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;

    if (!call) {
        callback(@[@(NO), @(-3), @"The call is not found."]);
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [call switchCamera];
    });
    callback(@[@(YES), @(0), @"Success"]);
}

RCT_EXPORT_METHOD(enableVideo:(NSString *)uuid enableVideo:(BOOL)enableVideo callback:(RCTResponseSenderBlock)callback) {

    if (!uuid.length) {
        callback(@[@(NO), @(-2), @"The call id is invalid."]);
        return;
    }

    StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;

    if (!call) {
        callback(@[@(NO), @(-3), @"The call is not found."]);
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [call enableLocalVideo:enableVideo];
    });
    callback(@[@(YES), @(0), @"Success"]);
}

RCT_EXPORT_METHOD(sendCallInfo:(NSString *)uuid callInfo:(NSString *)callInfo callback:(RCTResponseSenderBlock)callback) {
    if (uuid.length) {
        StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;
        if (call) {

            NSError *jsonError;
            NSData *objectData = [callInfo dataUsingEncoding:NSUTF8StringEncoding];
            NSDictionary *data = [NSJSONSerialization JSONObjectWithData:objectData
                                                        options:NSJSONReadingMutableContainers
                                                        error:&jsonError];

            if (jsonError) {
                callback(@[@(NO), @(-4), @"The call info format is invalid."]);
            } else {
                [call sendCallInfo:data completionHandler:^(BOOL status, int code, NSString *message) {
                    if (status) {
                        callback(@[@(YES), @(0), @"Sends successfully"]);
                    } else {
                        callback(@[@(NO), @(-1), @"Failed to send. The client is not connected to Stringee Server."]);
                    }
                }];
            }

        } else {
            callback(@[@(NO), @(-3), @"Failed to send. The call is not found"]);
        }
    } else {
        callback(@[@(NO), @(-2), @"Failed to send. The uuid is invalid"]);
    }
}

RCT_EXPORT_METHOD(setAutoSendTrackMediaStateChangeEvent:(NSString *)uuid autoSendTrackMediaStateChangeEvent:(BOOL)autoSendTrackMediaStateChangeEvent callback:(RCTResponseSenderBlock)callback) {

    if (!uuid.length) {
        callback(@[@(NO), @(-2), @"The uuid is invalid."]);
        return;
    }

    StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;

    if (!call) {
        callback(@[@(NO), @(-3), @"The call is not found."]);
        return;
    }
    
    call.autoSendTrackMediaState = autoSendTrackMediaStateChangeEvent;
    callback(@[@(YES), @(0), @"Success"]);
}

RCT_EXPORT_METHOD(sendDTMF:(NSString *)uuid dtmf:(NSString *)dtmf callback:(RCTResponseSenderBlock)callback) {
    if (uuid.length) {
        StringeeCall2 *call = [[RNStringeeInstanceManager instance].call2Wrappers objectForKey:uuid].call;
        if (call) {
            NSArray *DTMF = @[@"0", @"1", @"2", @"3", @"4", @"5", @"6", @"7", @"8", @"9", @"*", @"#"];
            if ([DTMF containsObject:dtmf]) {

                CallDTMF dtmfParam;
        
                if ([dtmf isEqualToString:@"0"]) {
                    dtmfParam = CallDTMFZero;
                }
                else if ([dtmf isEqualToString:@"1"]) {
                    dtmfParam = CallDTMFOne;
                }
                else if ([dtmf isEqualToString:@"2"]) {
                    dtmfParam = CallDTMFTwo;
                }
                else if ([dtmf isEqualToString:@"3"]) {
                    dtmfParam = CallDTMFThree;
                }
                else if ([dtmf isEqualToString:@"4"]) {
                    dtmfParam = CallDTMFFour;
                }
                else if ([dtmf isEqualToString:@"5"]) {
                    dtmfParam = CallDTMFFive;
                }
                else if ([dtmf isEqualToString:@"6"]) {
                    dtmfParam = CallDTMFSix;
                }
                else if ([dtmf isEqualToString:@"7"]) {
                    dtmfParam = CallDTMFSeven;
                }
                else if ([dtmf isEqualToString:@"8"]) {
                    dtmfParam = CallDTMFEight;
                }
                else if ([dtmf isEqualToString:@"9"]) {
                    dtmfParam = CallDTMFNine;
                }
                else if ([dtmf isEqualToString:@"*"]) {
                    dtmfParam = CallDTMFStar;
                }
                else {
                    dtmfParam = CallDTMFPound;
                }

                [call sendDTMF:dtmfParam completionHandler:^(BOOL status, int code, NSString *message) {
                    if (status) {
                        callback(@[@(YES), @(0), @"Sends successfully"]);
                    } else {
                        callback(@[@(NO), @(code), message]);
                    }
                }];
            } else {
                callback(@[@(NO), @(-4), @"Failed to send. The dtmf is invalid."]);
            }
        } else {
            callback(@[@(NO), @(-3), @"Failed to send. The call is not found."]);
        }
    } else {
        callback(@[@(NO), @(-2), @"Failed to send. The uuid is invalid."]);
    }
}

RCT_EXPORT_METHOD(generateUUID:(NSString *)callId serial:(nonnull NSNumber *)serial callback:(RCTResponseSenderBlock)callback) {
    NSString *uuid = [RNStringeeInstanceManager.instance generateUUID:callId serial:serial];
    callback(@[uuid]);
}


@end
