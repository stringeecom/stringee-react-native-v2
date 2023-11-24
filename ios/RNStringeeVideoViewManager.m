#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTBridge.h"
#else
#import "React/RCTBridge.h"
#endif
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>
#import "RNStringeeVideoViewManager.h"

@implementation RNStringeeVideoViewManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(local, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scalingType, NSString)
RCT_EXPORT_VIEW_PROPERTY(streamId, NSString)
RCT_EXPORT_VIEW_PROPERTY(uuid, NSString)
RCT_EXPORT_VIEW_PROPERTY(videoTrack, NSDictionary)

RCT_EXPORT_METHOD(reload: (nonnull NSNumber*) reactTag) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RNStringeeVideoView *videoView = (RNStringeeVideoView *)viewRegistry[reactTag];
        if (!videoView || ![videoView isKindOfClass:[RNStringeeVideoView class]]) {
            RCTLogError(@"Cannot find RNStringeeVideoView with tag #%@", reactTag);
            return;
        }
        [videoView reload];
    }];
}
- (UIView *)view {
    // Init native View that will be converted to react-native view
    RNStringeeVideoView *videoView = [[RNStringeeVideoView alloc] init];
    return videoView;
}

@end
