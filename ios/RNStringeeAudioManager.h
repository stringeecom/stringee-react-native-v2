#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridgeModule.h>

@class RNStringeeAudio;

@interface RNStringeeAudioManager : NSObject

// Audio manager methods
- (void)startAudioManagerWithCallback:(RCTResponseSenderBlock)callback eventEmitter:(RNStringeeAudio *)eventEmitter;
- (void)stopAudioManagerWithCallback:(RCTResponseSenderBlock)callback;
- (void)selectAudioDevice:(NSDictionary *)deviceData callback:(RCTResponseSenderBlock)callback;

@end
