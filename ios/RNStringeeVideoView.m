
#import <React/RCTLog.h>
#import "RNStringeeInstanceManager.h"
#import "RNStringeeVideoView.h"

NSString *const videoViewName = @"STRINGEE-VIDEO-VIEW";

@implementation RNStringeeVideoView {
    BOOL hasDisplayed;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        [self addObserver:self forKeyPath:@"bounds" options:0 context:nil];
        [self addObserver:self forKeyPath:@"frame" options:0 context:nil];
        self.videoSize = CGSizeZero;
    }
    return self;
}

- (void)dealloc {
    [self removeObserver:self forKeyPath:@"bounds"];
    [self removeObserver:self forKeyPath:@"frame"];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    
    StringeeVideoContentMode mode = StringeeVideoContentModeScaleAspectFill;
    if ([_scalingType isEqualToString:@"fit"]) {
        mode = StringeeVideoContentModeScaleAspectFit;
    }
    
    if (!hasDisplayed) {
        if (_uuid.length && _videoTrack) {
            RNCall2Wrapper *wrapper = [RNStringeeInstanceManager.instance.call2Wrappers objectForKey:_uuid];
            
            if (wrapper) {
                NSString *localId = [_videoTrack objectForKey:@"localId"];
                NSString *serverId = [_videoTrack objectForKey:@"serverId"];
                
                StringeeVideoTrack *track;
                
                if (serverId != nil && serverId.length > 0) {
                    if ([wrapper.videoTrack objectForKey:serverId]) {
                        track = [wrapper.videoTrack objectForKey:serverId];
                    }
                }
                
                if (track == nil && localId != nil && localId.length > 0) {
                    if ([wrapper.videoTrack objectForKey:localId]) {
                        track = [wrapper.videoTrack objectForKey:localId];
                    }
                }
                
                if (track != nil) {
                    StringeeVideoView *videoView = [track attachWithVideoContentMode:mode];
                    if (videoView != nil) {
                        videoView.frame = CGRectMake(0, 0, self.bounds.size.width, self.bounds.size.height);
                        [self addSubview:videoView];
                        videoView.layer.name = videoViewName;
                        hasDisplayed = true;
                    }
                }
            }
        }
    }
    
    if (!hasDisplayed && _uuid.length > 0) {
        StringeeCall *call = [RNStringeeInstanceManager.instance.callWrappers objectForKey:_uuid].call;
        if (call) {
            if (_local) {
                call.localVideoView.layer.name = videoViewName;
                call.localVideoView.frame = CGRectMake(0, 0, self.bounds.size.width, self.bounds.size.height);
                call.localVideoView.contentMode = mode;
                [self addSubview:call.localVideoView];
            } else {
                call.remoteVideoView.layer.name = videoViewName;
                call.remoteVideoView.frame = CGRectMake(0, 0, self.bounds.size.width, self.bounds.size.height);
                call.remoteVideoView.contentMode = mode;
                [self addSubview:call.remoteVideoView];
            }
            hasDisplayed = true;
        }
    }
    
    if (!hasDisplayed) {
        RCTLogError(@"Stringee Error | Render StringeeVideoView Error");
    }
}

- (void)reload {
    dispatch_async(dispatch_get_main_queue(), ^{
        self->hasDisplayed = false;
        
        for (UIView *view in self.subviews) {
            if ([view.layer.name isEqualToString:videoViewName]) {
                [view removeFromSuperview];
            }
        }
        
        [self setNeedsLayout];
        [self layoutIfNeeded];
    });
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {
    if (object == self) {
        if (([keyPath isEqualToString:@"bounds"] || [keyPath isEqualToString:@"frame"])) {
            if (!CGSizeEqualToSize(self.videoSize, CGSizeZero)) {
                if (self.subviews != nil && self.subviews.count > 0 && self.subviews[0] != nil) {
                    UIView *subView = (UIView *)self.subviews[0];
                    [self updateFrameToFitVideoSize:self.videoSize subView:subView superView:self];
                }
            }
        }
    }
}

- (void)videoView:(StringeeRemoteVideoView *)videoView didChangeVideoSize:(CGSize)size {
    // Thay đổi frame của StringeeRemoteVideoView khi kích thước video thay đổi
    self.videoSize = size;
    [self updateFrameToFitVideoSize:size subView:videoView superView:self];
}

- (void)updateFrameToFitVideoSize:(CGSize)size subView:(UIView *)subView superView:(UIView *)superView {
    dispatch_async(dispatch_get_main_queue(), ^{
        CGFloat superWidth = superView.frame.size.width;
        CGFloat superHeight = superView.frame.size.height;
        
        CGFloat newWidth, newHeight;
        
        if (size.width > size.height) {
            newWidth = superWidth;
            newHeight = newWidth * size.height / size.width;
            subView.frame = CGRectMake(0, (superHeight - newHeight) * 0.5, newWidth, newHeight);
        } else {
            newHeight = superHeight;
            newWidth = newHeight * size.width / size.height;
            subView.frame = CGRectMake((superWidth - newWidth) * 0.5, 0, newWidth, newHeight);
        }
    });
}

@end

