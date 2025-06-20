//
//  RNStringeeAudio.m
//  RNStringee
//
//  Created by StringeeTeam on 6/20/25.
//  Copyright © 2025 Stringee. All rights reserved.
//

#import "RNStringeeAudio.h"

@interface RNStringeeAudio ()

@property (nonatomic, strong) NSMutableArray *events;

@end

@implementation RNStringeeAudio

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _audioManager = [[RNStringeeAudioManager alloc] init];
        _audioManager.delegate = self;
        _events = [[NSMutableArray alloc] init];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onAudioDeviceChange"];
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(start:(RCTResponseSenderBlock)callback) {
    [self.audioManager startAudioManager];
    callback(@[@YES, @0, @"Audio manager started successfully"]);
}

RCT_EXPORT_METHOD(stop:(RCTResponseSenderBlock)callback) {
    [self.audioManager stopAudioManager];
    callback(@[@YES, @0, @"Audio manager stopped successfully"]);
}

RCT_EXPORT_METHOD(selectDevice:(NSDictionary *)device callback:(RCTResponseSenderBlock)callback) {
    if (![device isKindOfClass:[NSDictionary class]]) {
        callback(@[@NO, @-1, @"Invalid device parameter"]);
        return;
    }
    
    [self.audioManager selectAudioDevice:device];
    callback(@[@YES, @0, @"Device selected successfully"]);
}

RCT_EXPORT_METHOD(setNativeEvent:(NSString *)event) {
    if (![self.events containsObject:event]) {
        [self.events addObject:event];
    }
}

RCT_EXPORT_METHOD(removeNativeEvent:(NSString *)event) {
    [self.events removeObject:event];
}

#pragma mark - RNStringeeAudioManagerDelegate

- (void)audioManager:(RNStringeeAudioManager *)manager didUpdateAudioState:(NSDictionary *)audioState {
    if ([self.events containsObject:@"onAudioDeviceChange"]) {
        // Transform data to match JavaScript expectations
        NSDictionary *transformedData = @{
            @"selectedAudioDevice": audioState[@"device"] ?: [NSNull null],
            @"availableAudioDevices": audioState[@"devices"] ?: @[]
        };
        
        [self sendEventWithName:@"onAudioDeviceChange" body:@{@"data": transformedData}];
    }
}

@end
