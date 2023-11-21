#import <Foundation/Foundation.h>
#import <Stringee/Stringee.h>

@interface RNCall2Wrapper : NSObject <StringeeCall2Delegate>
@property (nonatomic) NSString *identifier;
@property (nonatomic) StringeeCall2 *call;

- (instancetype) initWithIdentifier:(NSString *)identifier clientUUID:(NSString *)clientUUID;

- (void)setNativeEvent:(NSString *)event;

- (void)removeNativeEvent:(NSString *)event;

- (StringeeClient *)getClient;

@end
