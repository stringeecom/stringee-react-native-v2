#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTBridge.h"
#else
#import "React/RCTBridge.h"
#endif
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>
#import "RNStringeeVideoViewManager.h"

@implementation RNStringeeVideoViewManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(local, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scalingType, NSString)
RCT_EXPORT_VIEW_PROPERTY(streamId, NSString)
RCT_EXPORT_VIEW_PROPERTY(uuid, NSString)
RCT_EXPORT_VIEW_PROPERTY(videoTrack, NSDictionary)

RCT_EXPORT_METHOD(reload : (nonnull NSNumber *)reactTag newProperty : (NSDictionary *)newProperty) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNStringeeVideoView *videoView = (RNStringeeVideoView *)viewRegistry[reactTag];
        if (!videoView || ![videoView isKindOfClass:[RNStringeeVideoView class]]) {
            RCTLogError(@"StringeeError | Cannot find RNStringeeVideoView with tag #%@", reactTag);
            return;
        }
        
        double with = [newProperty[@"width"] doubleValue];
        double height = [newProperty[@"height"] doubleValue];
        
        videoView.videoSize = CGSizeMake(with, height);
        videoView.uuid = newProperty[@"uuid"];
        videoView.videoTrack = newProperty[@"videoTrack"];
        videoView.scalingType = newProperty[@"scalingType"];
        videoView.local = [newProperty[@"local"] boolValue];
        [videoView reload];
    }];
}

- (UIView *)view {
    // Init native View that will be converted to react-native view
    RNStringeeVideoView *videoView = [[RNStringeeVideoView alloc] init];
    return videoView;
}

@end
