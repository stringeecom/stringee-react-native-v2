//
//  RNStringeeCallWrapper.h
//  RNStringee
//
//  Created by Hiệp Hoàng on 20/11/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Stringee/Stringee.h>
#import "RNClientWrapper.h"

@interface RNCallWrapper : NSObject <StringeeCallDelegate>
@property (nonatomic) NSString *identifier;
@property (nonatomic) StringeeCall *call;

- (instancetype) initWithIdentifier:(NSString *)identifier clientUUID:(NSString *)clientUUID;

- (void)setNativeEvent:(NSString *)event;

- (void)removeNativeEvent:(NSString *)event;

- (StringeeClient *)getClient;

@end
