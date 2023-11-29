
#import "RNStringeeInstanceManager.h"

@implementation RNStringeeInstanceManager {
    NSMutableDictionary *uuids;
    CXCallObserver *callObs;
}

// for managing clients
+ (RNStringeeInstanceManager *)instance {
    static RNStringeeInstanceManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[RNStringeeInstanceManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _call2VideoTracks = [[NSMutableDictionary alloc] init];
        _clientWrappers = [[NSMutableDictionary alloc] init];
        _callWrappers = [[NSMutableDictionary alloc] init];
        _call2Wrappers = [[NSMutableDictionary alloc] init];
        uuids = [[NSMutableDictionary alloc] init];
        callObs = [[CXCallObserver alloc] init];
        [callObs setDelegate:self queue:nil];
    }
    return self;
}

- (NSString *)generateUUID:(NSString *)callID serial:(NSNumber *)serial {
    if (serial == nil) {
        serial = @(1);
    }
    NSString *key = [[NSString alloc] initWithFormat:@"%@-%@", callID, serial];
    NSString *value = [uuids objectForKey:key];
    
    if (value) {
        return value;
    } else {
        value = [[[NSUUID UUID] UUIDString] lowercaseString];
        [uuids setObject:value forKey:key];
        return value;
    }
}

- (void)callObserver:(CXCallObserver *)callObserver callChanged:(CXCall *)call {
    if (!call.hasEnded) {
        return;
    }
    NSString *key;
    NSEnumerator *enumerator = [uuids keyEnumerator];
    
    
    while ((key = [enumerator nextObject])) {
        NSString *value = [uuids objectForKey:key];
        if ([value isEqualToString:call.UUID.UUIDString.lowercaseString]) {
            [uuids removeObjectForKey:key];
        }
    }
}

@end

