//
//  RCTConvert+StringeeHelper.m
//  RNStringee
//
//  Created by HoangDuoc on 11/16/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RCTConvert+StringeeHelper.h"
#import "RNStringeeInstanceManager.h"
#import <React/RCTUtils.h>

@implementation RCTConvert (StringeeHelper)

//RCT_ENUM_CONVERTER(StringeeMessageType,(@{
//                                          @"Text" : @(StringeeMessageTypeText),
//                                          @"Photo" : @(StringeeMessageTypePhoto),
//                                          @"Video" : @(StringeeMessageTypeVideo),
//                                          @"Audio" : @(StringeeMessageTypeAudio),
//                                          @"File" : @(StringeeMessageTypeFile),
//                                          @"CreateGroup" : @(StringeeMessageTypeCreateGroup),
//                                          @"RenameGroup" : @(StringeeMessageTypeRenameGroup),
//                                          @"Location" : @(StringeeMessageTypeLocation),
//                                          @"Contact" : @(StringeeMessageTypeContact),
//                                          @"Notify" : @(StringeeMessageTypeNotify)
//                                        }), StringeeMessageTypeText, integerValue)
//
//RCT_ENUM_CONVERTER(StringeeMessageStatus,(@{
//                                            @"Pending" : @(StringeeMessageStatusPending),
//                                            @"Sending" : @(StringeeMessageStatusSending),
//                                            @"Sent" : @(StringeeMessageStatusSent),
//                                            @"Delivered" : @(StringeeMessageStatusDelivered),
//                                            @"Read" : @(StringeeMessageStatusRead)
//                                          }), StringeeMessageStatusPending, integerValue)

+ (NSDictionary *)StringeeIdentity:(StringeeIdentity *)identity {
    if (!identity) return RCTNullIfNil(nil);
    
    NSString *userId = identity.userId.length ? identity.userId : @"";
    NSString *name = identity.displayName.length ? identity.displayName : @"";
    NSString *avatar = identity.avatarUrl.length ? identity.avatarUrl : @"";
    NSString *role = identity.role == StringeeRoleAdmin ? @"admin" : @"member";
    NSString *email = identity.email.length ? identity.email : @"";
    NSString *phone = identity.phone.length ? identity.phone : @"";
    NSString *location = identity.location.length ? identity.location : @"";
    NSString *browser = identity.browser.length ? identity.browser : @"";
    NSString *platform = identity.platform.length ? identity.platform : @"";
    NSString *device = identity.device.length ? identity.device : @"";
    NSString *ipAddress = identity.ipaddress.length ? identity.ipaddress : @"";
    NSString *hostName = identity.hostname.length ? identity.hostname : @"";
    NSString *userAgent = identity.useragent.length ? identity.useragent : @"";

    return @{
             @"userId": userId,
             @"name": name,
             @"avatar": avatar,
             @"role": role,
             @"email": email,
             @"phone": phone,
             @"location": location,
             @"browser": browser,
             @"platform": platform,
             @"device": device,
             @"ipAddress": ipAddress,
             @"hostName": hostName,
             @"userAgent": userAgent
             };
}

+ (NSArray *)StringeeIdentities:(NSArray<StringeeIdentity *> *)identities {
    if (!identities) {
        return RCTNullIfNil(nil);
    }
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeIdentity *identity in identities) {
        [response addObject:[self StringeeIdentity:identity]];
    }
    return response;
}

+ (NSDictionary *)StringeeConversation:(StringeeConversation *)conversation {
    if (!conversation) return RCTNullIfNil(nil);

    NSString *identifier = conversation.identifier ? conversation.identifier : @"";
    NSString *name = conversation.name ? conversation.name : @"";
    NSString *lastMsgId = conversation.lastMsg.identifier ? conversation.lastMsg.identifier : @"";

    NSMutableArray *participants = [[NSMutableArray alloc] init];
    for (StringeeIdentity *identity in conversation.participants) {
        [participants addObject:[self StringeeIdentity:identity]];
    }
    NSString *lastMsgSender = conversation.lastMsg.sender ? conversation.lastMsg.sender : @"";
    NSString *text = conversation.lastMsg.content ? conversation.lastMsg.content : @"";
    id lastMsgContent = [self StringToDictionary:text];
    NSString *creator = conversation.creator ? conversation.creator : @"";
    StringeeMessageStatus lastMsgState = conversation.lastMsgSeqReceived > conversation.lastMsgSeqSeen ? StringeeMessageStatusDelivered : StringeeMessageStatusRead;
    id pinMsgId = conversation.pinMsgId != nil && conversation.pinMsgId.length > 0 ? conversation.pinMsgId : [NSNull null];
    
    return @{
             @"id": identifier,
             @"name": name,
             @"participants": participants,
             @"isGroup": @(conversation.isGroup),
             @"updatedAt" : @(conversation.lastUpdate),
             @"lastMsgSender" : lastMsgSender,
             @"text": lastMsgContent,
             @"lastMsgType": @(conversation.lastMsg.type),
             @"unreadCount": @(conversation.unread),
             @"lastMsgId": lastMsgId,
             @"creator": creator,
             @"created" : @(conversation.created),
             @"lastMsgSeq": @(conversation.lastMsgSeqReceived),
             @"lastMsgCreatedAt": @(conversation.lastTimeNewMsg),
             @"lastMsgState": @(lastMsgState),
             @"pinMsgId": pinMsgId
             };
}

+ (NSArray *)StringeeConversations:(NSArray<StringeeConversation *> *)conversations {
    if (!conversations) {
//        return RCTNullIfNil(nil);
        return @[];
    }
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeConversation *conversation in conversations) {
        [response addObject:[self StringeeConversation:conversation]];
    }
    return response;
}

+ (NSDictionary *)StringeeMessage:(StringeeMessage *)message {
    if (!message) return RCTNullIfNil(nil);
    
    NSString *localId = message.localIdentifier.length ? message.localIdentifier : @"";
    NSString *identifier = message.identifier.length ? message.identifier : @"";
    NSString *conversationId = message.convId.length ? message.convId : @"";
    NSString *sender = message.sender.length ? message.sender : @"";
    
    // Cần parse text và type ở đây
//    NSString *text = @"";
//    NSNumber *type = [NSNumber numberWithInt:1];
//    NSString *content = message.content.length ? message.content : @"";
//    if (message.type == StringeeMessageTypeCreateGroup || message.type == StringeeMessageTypeRenameGroup || message.type == StringeeMessageTypeNotify) {
//        text = content;
//        type = [NSNumber numberWithInt:message.type];
//    } else {
//         NSError *jsonError;
//         NSData *msgData = [content dataUsingEncoding:NSUTF8StringEncoding];
//         NSDictionary *dicData = [NSJSONSerialization JSONObjectWithData:msgData
//                                                                 options:NSJSONReadingMutableContainers
//                                                                   error:&jsonError];
//
////         text = dicData[@"text"] != nil && dicData[@"text"] != [NSNull null] ? dicData[@"text"] : @"";
//        text = content;
//        type = dicData[@"type"] != nil && dicData[@"type"] != [NSNull null] ? dicData[@"type"] : [NSNumber numberWithInt:1];
//    }
    
    NSString *thumbnailPath = @"";
    NSString *thumbnailUrl = @"";
    NSString *filePath = @"";
    NSString *fileUrl = @"";
    double longitude = 0;
    double latitude = 0;
    double duration = 0;
    double ratio = 0;
    NSUInteger fileLength = 0;
    NSString *fileName = @"";
    NSString *contact = @"";
    
    NSDictionary *content;
    
    switch (message.type) {
        case StringeeMessageTypeText:
            content = @{@"content": message.content};
            break;
        case StringeeMessageTypeLink:
            content = @{@"content": message.content};
            break;
        case StringeeMessageTypeCreateGroup:
            content = [self StringToDictionary:message.content];
            break;
        case StringeeMessageTypeRenameGroup:
            content = [self StringToDictionary:message.content];
            break;
        case StringeeMessageTypeNotify:
            content = [self StringToDictionary:message.content];
            break;
        case StringeeMessageTypePhoto:
        {
            StringeePhotoMessage *photoMsg = (StringeePhotoMessage *)message;
            thumbnailPath = photoMsg.thumbnailPath.length ? photoMsg.thumbnailPath : @"";
            thumbnailUrl = photoMsg.thumbnailUrl.length ? photoMsg.thumbnailUrl : @"";
            filePath = photoMsg.filePath.length ? photoMsg.filePath : @"";
            fileUrl = photoMsg.fileUrl.length ? photoMsg.fileUrl : @"";
            ratio = photoMsg.ratio;
            
            content = @{
                        @"photo": @{
                                    @"filePath": fileUrl,
                                    @"thumbnail": thumbnailUrl,
                                    @"ratio": @(ratio)
                                }
                        };
        }
            break;
        case StringeeMessageTypeVideo:
        {
            StringeeVideoMessage *videoMsg = (StringeeVideoMessage *)message;
            thumbnailPath = videoMsg.thumbnailPath.length ? videoMsg.thumbnailPath : @"";
            thumbnailUrl = videoMsg.thumbnailUrl.length ? videoMsg.thumbnailUrl : @"";
            filePath = videoMsg.filePath.length ? videoMsg.filePath : @"";
            fileUrl = videoMsg.fileUrl.length ? videoMsg.fileUrl : @"";
            ratio = videoMsg.ratio;
            duration = videoMsg.duration;
            
            content = @{
                        @"video": @{
                                    @"filePath": fileUrl,
                                    @"thumbnail": thumbnailUrl,
                                    @"ratio": @(ratio),
                                    @"duration": @(duration)
                                }
                        };
        }
            break;
        case StringeeMessageTypeAudio:
        {
            StringeeAudioMessage *audioMsg = (StringeeAudioMessage *)message;
            filePath = audioMsg.filePath.length ? audioMsg.filePath : @"";
            fileUrl = audioMsg.fileUrl.length ? audioMsg.fileUrl : @"";
            duration = audioMsg.duration;
            
            content = @{
                        @"audio": @{
                                @"filePath": fileUrl,
                                @"duration": @(duration)
                                }
                        };
        }
            break;
        case StringeeMessageTypeFile:
        {
            StringeeFileMessage *fileMsg = (StringeeFileMessage *)message;
            filePath = fileMsg.filePath.length ? fileMsg.filePath : @"";
            fileUrl = fileMsg.fileUrl.length ? fileMsg.fileUrl : @"";
            fileName = fileMsg.filename.length ? fileMsg.filename : @"";
            fileLength = fileMsg.length;
            
            content = @{
                        @"file": @{
                                @"filePath": fileUrl,
                                @"filename": fileName,
                                @"length": @(fileLength),
                                }
                        };
        }
            break;
        case StringeeMessageTypeLocation:
        {
            StringeeLocationMessage *locationMsg = (StringeeLocationMessage *)message;
            latitude = locationMsg.latitude;
            longitude = locationMsg.longitude;
            
            content = @{
                        @"location": @{
                                @"lat": @(latitude),
                                @"lon": @(longitude)
                                }
                        };
        }
            break;
        case StringeeMessageTypeContact:
        {
            StringeeContactMessage *contactMsg = (StringeeContactMessage *)message;
            NSString *vcard = contactMsg.vcard.length ? contactMsg.vcard : @"";
            
            content = @{
                        @"contact": @{
                                @"vcard": vcard
                                }
                        };
        }
            break;
            
        default:
            content = @{};
            break;
    }
    
    
    return @{
             @"localId": localId,
             @"id": identifier,
             @"conversationId": conversationId,
             @"sender": sender,
             @"createdAt": @(message.created),
             @"state": @(message.status),
             @"sequence": @(message.seq),
             @"type": @(message.type),
             @"content": content,
             @"thumbnailPath": thumbnailPath,
             @"thumbnailUrl": thumbnailUrl,
             @"filePath": filePath,
             @"fileUrl": fileUrl,
             @"latitude": @(latitude),
             @"longitude": @(longitude),
             @"duration": @(duration),
             @"ratio": @(ratio),
             @"fileName": fileName,
             @"fileLength": @(fileLength),
             @"contact": contact
             };
}

+ (NSArray *)StringeeMessages:(NSArray<StringeeMessage *> *)messages {
    if (!messages) {
        return RCTNullIfNil(nil);
    }
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeMessage *message in messages) {
        [response addObject:[self StringeeMessage:message]];
    }
    return response;
}

+ (NSDictionary *)SXChatProfile:(StringeeChatProfile *)profile {
    if (!profile) return RCTNullIfNil(nil);

    NSString *identifier = profile.identifier ? profile.identifier : @"";
    NSString *background = profile.background ? profile.background : @"";
    NSString *hour = profile.hour ? profile.hour : @"";
    NSString *language = profile.language ? profile.language : @"";
    NSString *logo_url = profile.logo_url ? profile.logo_url : @"";
    NSString *popup_answer_url = profile.popup_answer_url ? profile.popup_answer_url : @"";
    NSString *portal = profile.portal ? profile.portal : @"";
    NSArray *queues = [self SXQueues:profile.queues];

    return @{
             @"id": identifier,
             @"autoCreateTicket": @(profile.auto_create_ticket),
             @"background": background,
             @"enabled": @(profile.enabled),
             @"facebookAsLivechat" : @(profile.facebook_as_livechat),
             @"hour" : hour,
             @"language": language,
             @"logoUrl": logo_url,
             @"popupAnswerUrl": popup_answer_url,
             @"portal": portal,
             @"projectId" : @(profile.project_id),
             @"zaloAsLivechat": @(profile.zalo_as_livechat),
             @"queues": queues
             };
}

+ (NSDictionary *)SXQueue:(StringeeQueue *)queue {
    if (!queue) return RCTNullIfNil(nil);

    NSString *identifier = queue.identifier ? queue.identifier : @"";
    NSString *name = queue.name ? queue.name : @"";

    return @{
             @"id": identifier,
             @"name": name
             };
}

+ (NSArray *)SXQueues:(NSArray<StringeeQueue *> *)queues {
    if (!queues) {
        return RCTNullIfNil(nil);
    }
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeQueue *queue in queues) {
        [response addObject:[self SXQueue:queue]];
    }
    return response;
}

+ (NSDictionary *)StringeeVideoRoom:(StringeeVideoRoom *)room {
    if (!room) return RCTNullIfNil(nil);
    
    return @{
        @"id" : room.roomId,
        @"recored" : @(room.record)
    };
}

+ (NSDictionary *)StringeeChatRequest:(StringeeChatRequest *)request {
    if (!request) return RCTNullIfNil(nil);

    NSString *convId = request.convId ? request.convId : @"";
    NSString *customerId = request.customerId ? request.customerId : @"";
    NSString *customerName = request.customerName ? request.customerName : @"";

    return @{
             @"convId": convId,
             @"customerId": customerId,
             @"customerName": customerName,
             @"channelType": @(request.channelType),
             @"type": @(request.type)
             };
}

+ (NSDictionary *)StringeeRoomUserInfo:(StringeeRoomUserInfo *)request {
    if (!request) return RCTNullIfNil(nil);
    
    return @{
        @"userId" : request.userId ? request.userId : @""
    };
}

+(NSArray *)StringeeRoomUserInfos:(NSArray<StringeeRoomUserInfo *> *)request {
    if (!request) return RCTNullIfNil(nil);
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeRoomUserInfo *info in request) {
        [response addObject:[self StringeeRoomUserInfo:info]];
    }
    return response;
}

+ (NSDictionary *)StringeeVideoTrackInfo:(StringeeVideoTrackInfo *)trackInfo {
    if (!trackInfo) return RCTNullIfNil(nil);
    
    return @{
        @"id" : trackInfo.serverId ? trackInfo.serverId : @"",
        @"audio" : @(trackInfo.audio),
        @"video" : @(trackInfo.video),
        @"screen" : @(trackInfo.screen),
        @"publisher" : @{
            @"userId" : trackInfo.userPublish ? trackInfo.userPublish : @""
        }
    };
    
}

+ (NSArray *)StringeeVideoTrackInfos:(NSArray<StringeeVideoTrackInfo *> *)tracks {
    if (!tracks) return RCTNullIfNil(nil);
    NSMutableArray *response = [NSMutableArray array];
    for (StringeeVideoTrackInfo *track in tracks) {
        [response addObject:[self StringeeVideoTrackInfo:track]];
    }
    return  response;
}

+ (NSDictionary *)StringeeVideoTrack:(StringeeVideoTrack *)track {
    if (!track) return RCTNullIfNil(nil);
    return @{
        @"localId": track.localId == nil ? @"" : track.localId,
        @"serverId": track.serverId == nil ? @"" : track.serverId,
        @"isLocal": @(track.isLocal),
        @"audio": @(track.audio),
        @"video": @(track.video),
        @"screen": @(track.screen),
        @"trackType": @(track.trackType),
        @"publisher": @{
            @"userId" : track.publisher.userId
        }
    };
}

// MARK: - Utils

+ (id)StringToDictionary:(NSString *)str {
    if (!str || !str.length) {
        return [NSNull null];
    }
    
    NSError *jsonError;
    NSData *objectData = [str dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];
    
    if (jsonError) {
        return [NSNull null];
    } else {
        return json;
    }
}

+ (BOOL)isValid:(NSString *)value {
    if (value == nil || ![value isKindOfClass:[NSString class]] || value.length == 0) {
        return false;
    }
    
    return true;
}

+ (BOOL)isValidEmail:(NSString *)emailTxt {
    NSString *emailRegex = @"[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}";
    NSPredicate *emailTest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", emailRegex];
    return [emailTest evaluateWithObject:emailTxt];
}

+ (StringeeVideoTrack *)searchTrackWithInfo:(NSDictionary *)info data:(NSDictionary<NSString *, StringeeVideoTrack *> *)data {
    NSString *localId = [info objectForKey:@"localId"];
    NSString *serverId = [info objectForKey:@"serverId"];
    
    if ([data objectForKey:serverId ] != nil) {
        return [ data objectForKey:serverId];
    }
    
    if ([data objectForKey:localId] != nil) {
        return [data objectForKey:localId];
    }
    return nil;
}


+ (StringeeVideoTrackInfo *)rnInfoDataToTrackInfo:(NSDictionary *) info {
    NSDictionary *userPublish = [info objectForKey:@"publisher"];
    return [[StringeeVideoTrackInfo alloc] initWithData:@{
        @"audio" : [info objectForKey:@"audio"],
        @"video" : [info objectForKey:@"video"],
        @"screen" : [info objectForKey:@"screen"],
        @"serverId" : [info objectForKey: @"id"],
        @"userPublish" : [userPublish objectForKey: @"userId"]
    }];
}
+ (StringeeVideoTrackOption *)rnInfoDataToTrackOption:(NSDictionary *)info {
    StringeeVideoTrackOption *option = [[StringeeVideoTrackOption alloc] init];
    option.audio = [info objectForKey:@"audio"];
    option.video = [info objectForKey:@"video"];
    NSString *dimenstion = [info objectForKey: @"videoResolution"];
    
    if ([dimenstion isEqualToString:@"HD"]) {
        option.videoDimension = StringeeVideoDimension720p;
    }
    if ([dimenstion isEqualToString:@"FULL_HD"]) {
        option.videoDimension = StringeeVideoDimension1080p;
    }
    
    return option;
}
+ (StringeeVideoTrack *)searchTrackOnRoom:(NSDictionary *)info {
    NSString *roomId = [info objectForKey: @"roomId"];
    RNRoomWrapper *wrapper = [RNStringeeInstanceManager.instance.roomWrappers objectForKey: roomId];
    return [self searchTrackWithInfo:info data:wrapper.videoTrack];
}

@end
