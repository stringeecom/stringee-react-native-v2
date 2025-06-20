//
//  RNStringeeAudioManager.h
//  RNStringee
//
//  Created by StringeeTeam on 6/20/25.
//  Copyright © 2025 Stringee. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

@protocol RNStringeeAudioManagerDelegate <NSObject>
@optional
- (void)audioManager:(id)manager didUpdateAudioState:(NSDictionary *)audioState;
@end

@interface RNStringeeAudioManager : NSObject

@property (nonatomic, weak) id<RNStringeeAudioManagerDelegate> delegate;

// Audio manager methods
- (void)startAudioManager;
- (void)stopAudioManager;
- (void)selectAudioDevice:(NSDictionary *)deviceInfo;
- (void)sendAudioStateUpdate;

@end
