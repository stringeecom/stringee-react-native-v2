//
//  RNStringeeAudio.h
//  RNStringee
//
//  Created by StringeeTeam on 6/20/25.
//  Copyright © 2025 Stringee. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "RNStringeeAudioManager.h"

@interface RNStringeeAudio : RCTEventEmitter <RCTBridgeModule, RNStringeeAudioManagerDelegate>

@property (nonatomic, strong) RNStringeeAudioManager *audioManager;

@end
