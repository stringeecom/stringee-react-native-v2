
#import <Foundation/Foundation.h>
#import "RNStringeeClient.h"
#import "RNStringeeCall.h"
#import "RNStringeeCall2.h"
#import "RNClientWrapper.h"
#import "RNCallWrapper.h"
#import "RNCall2Wrapper.h"
#import <CallKit/CallKit.h>

@interface RNStringeeInstanceManager : NSObject<CXCallObserverDelegate>

+ (RNStringeeInstanceManager*)instance;

@property(strong, nonatomic) RNStringeeClient *rnClient;
@property(strong, nonatomic) RNStringeeCall *rnCall;
@property(strong, nonatomic) RNStringeeCall2 *rnCall2;

@property(strong, nonatomic) NSMutableDictionary *call2VideoTracks;

// For multi client
@property(strong, nonatomic) NSMutableDictionary<NSString *, RNClientWrapper *> *clientWrappers;

// For multi call
@property(strong, nonatomic) NSMutableDictionary<NSString *, RNCallWrapper *> *callWrappers;

// For multi call2
@property(strong, nonatomic) NSMutableDictionary<NSString *, RNCall2Wrapper *> *call2Wrappers;

// For callKeep
-(NSString *)generateUUID:(NSString *)callID serial:(NSNumber *)serial;

@end
