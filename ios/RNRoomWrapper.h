//
//  RNRoomWrapper.h
//  RNStringee
//
//  Created by Hiệp Hoàng on 11/12/2023.
//

#import <Stringee/Stringee.h>

@interface RNRoomWrapper : NSObject <StringeeVideoRoomDelegate, StringeeVideoTrackDelegate>

@property (nonatomic) StringeeVideoRoom *room;
@property (strong, nonatomic) NSMutableDictionary<NSString *, StringeeVideoTrack *> *videoTrack;

- (instancetype) initWithRoom:(StringeeVideoRoom *)room;
- (void)setNativeEvent:(NSString *)event;
- (void)removeNativeEvent:(NSString *)event;
- (void) pushTrack:(StringeeVideoTrack *)track

@end
