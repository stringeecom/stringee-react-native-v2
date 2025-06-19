#import "RNStringeeAudio.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>

@implementation RNStringeeAudio {
  NSString *eventName;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _audioManager = [[RNStringeeAudioManager alloc] init];
    }
    return self;
}

// Required to specify supported events
- (NSArray<NSString *> *)supportedEvents {
    return @[@"StringeeAudioEvents"];
}

// Start the audio manager
RCT_EXPORT_METHOD(start:(RCTResponseSenderBlock)callback) {
    [self.audioManager startAudioManagerWithCallback:callback eventEmitter:self];
}

// Stop the audio manager
RCT_EXPORT_METHOD(stop:(RCTResponseSenderBlock)callback) {
    [self.audioManager stopAudioManagerWithCallback:callback];
}

// Select audio device
RCT_EXPORT_METHOD(selectDevice:(NSDictionary *)deviceData callback:(RCTResponseSenderBlock)callback) {
    [self.audioManager selectAudioDevice:deviceData callback:callback];
}

// Set native event name for emitting
RCT_EXPORT_METHOD(setNativeEvent:(NSString *)eventName) {
    self->eventName = eventName;
}

// Remove native event
RCT_EXPORT_METHOD(removeNativeEvent:(NSString *)eventName) {
    // Implementation for removing event listener if needed
    self->eventName = nil;
}

// Send event to React Native
- (void)sendEventToReactNative:(NSDictionary *)eventData {
    if (eventName && [self.bridge isValid]) {
        [self sendEventWithName:eventName body:@{@"data": eventData}];
    }
}

@end
