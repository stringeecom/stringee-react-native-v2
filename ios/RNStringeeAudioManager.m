//
//  RNStringeeAudioManager.m
//  RNStringee
//
//  Created by Tai Phan Van on 18/6/25.
//  Copyright © 2025 Facebook. All rights reserved.
//

#import "RNStringeeAudioManager.h"
#import "RNStringeeAudio.h"

@interface CustomPortDescription : NSObject
@property (nonatomic, copy) NSString *portType;
@property (nonatomic, copy) NSString *portName;
@property (nonatomic, copy) NSString *UID;

- (instancetype)initWithPortDescription:(AVAudioSessionPortDescription *)portDescription;

@end

@implementation CustomPortDescription

- (instancetype)initWithPortDescription:(AVAudioSessionPortDescription *)portDescription {
    self = [super init];
    if (self) {
        _UID = portDescription.UID;
        _portType = portDescription.portType;
        _portName = portDescription.portName;
    }
    return self;
}

- (instancetype)initWithPortType:(NSString *)portType portName:(NSString *)portName UID:(NSString *)UID {
    self = [super init];
    if (self) {
        _UID = UID;
        _portType = portType;
        _portName = portName;
    }
    return self;
}

- (void)updateWithOutputPort:(AVAudioSessionPortDescription *)output {
    // Optional: Add logic to update device details based on output information if needed
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<CustomPortDescription: portType=%@, portName=%@, UID=%@>",
            self.portType, self.portName, self.UID];
}

@end

@interface RNStringeeAudioManager ()

// Audio manager state
@property (nonatomic, strong, nullable) AVAudioSessionPortDescription *selectedAudioDevice;
@property (nonatomic, strong, nullable) NSArray<AVAudioSessionPortDescription *> *inputDevices;
@property (nonatomic, strong, nullable) NSArray<AVAudioSessionPortDescription *> *outputDevices;
@property (nonatomic, strong, nullable) NSArray<CustomPortDescription *> *availableAudioDevices;
@property (nonatomic, weak) RNStringeeAudio *eventEmitter;

@end

@implementation RNStringeeAudioManager

- (instancetype)init {
    self = [super init];
    if (self) {
        _availableAudioDevices = @[];
        _selectedAudioDevice = nil;
        _inputDevices = @[];
        _outputDevices = @[];
    }
    return self;
}

#pragma mark - Audio Manager Methods

- (void)startAudioManagerWithCallback:(RCTResponseSenderBlock)callback eventEmitter:(RNStringeeAudio *)eventEmitter {
    self.eventEmitter = eventEmitter;
    
    // Add notification observer for route changes
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleAudioRouteChange:)
                                                 name:AVAudioSessionRouteChangeNotification
                                               object:nil];

    #if DEBUG
    NSLog(@"[Stringee] Audio manager started");
    #endif

    // Notify success
    if (callback) {
        callback(@[@YES, @0, @"Audio manager started"]);
    }

    // Send initial audio state update
    [self sendAudioStateUpdate];
}

- (void)stopAudioManagerWithCallback:(RCTResponseSenderBlock)callback {
    // Remove notification observer for route changes
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:AVAudioSessionRouteChangeNotification
                                                  object:nil];
    
    // Reset audio manager state
    self.selectedAudioDevice = nil;
    self.inputDevices = nil;
    self.outputDevices = nil;
    self.availableAudioDevices = nil;
    self.eventEmitter = nil;

    #if DEBUG
    NSLog(@"[Stringee] Audio manager stopped");
    #endif

    // Notify success
    if (callback) {
        callback(@[@YES, @0, @"Audio manager stopped"]);
    }
}

- (void)selectAudioDevice:(NSDictionary *)deviceData callback:(RCTResponseSenderBlock)callback {
    #if DEBUG
    NSLog(@"[Stringee] current audio device = %@", self.selectedAudioDevice);
    NSLog(@"[Stringee] Selecting audio device: %@", deviceData);
    #endif

    // Parse device data
    NSNumber *audioTypeNumber = deviceData[@"type"];
    NSString *deviceName = deviceData[@"name"];
    NSString *deviceUUID = deviceData[@"uuid"];
    
    if (!audioTypeNumber || !deviceName || !deviceUUID) {
        if (callback) {
            callback(@[@NO, @-1, @"Invalid device data"]);
        }
        return;
    }
    
    NSInteger audioType = [audioTypeNumber integerValue];
    NSString *portType = [self portTypeFromAudioType:audioType];
    
    if (!portType) {
        if (callback) {
            callback(@[@NO, @-2, @"Unsupported audio device type"]);
        }
        return;
    }

    // Create CustomPortDescription from device data
    CustomPortDescription *device = [[CustomPortDescription alloc] initWithPortType:portType 
                                                                            portName:deviceName 
                                                                                 UID:deviceUUID];

    // Check if the device is already selected
    if (self.selectedAudioDevice && [self.selectedAudioDevice.UID isEqualToString:device.UID]) {
        // Notify success
        if (callback) {
            callback(@[@YES, @0, @"Audio device already selected"]);
        }
        return;
    }

    // Check if the device is built-in speaker
    if ([device.portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
        // Set speaker as the audio output
        AVAudioSession *audioSession = [AVAudioSession sharedInstance];
        [self handleSpeakerSelectionWithAudioSession:audioSession callback:callback];
        return;
    }

    // Get available inputs
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSArray<AVAudioSessionPortDescription *> *availableInputs = audioSession.availableInputs;

    // Check if the device is available
    AVAudioSessionPortDescription *deviceInput = nil;
    for (AVAudioSessionPortDescription *input in availableInputs) {
        if ([input.UID isEqualToString:device.UID]) {
            deviceInput = input;
            break;
        }
    }
    
    if (deviceInput) {
        #if DEBUG
        NSLog(@"[Stringee] Device found in available inputs: device = %@", deviceInput);
        #endif
        // Set preferred input
        NSError *error = nil;
        [audioSession setPreferredInput:deviceInput error:&error];
        if (error) {
            if (callback) {
                callback(@[@NO, @-3, [NSString stringWithFormat:@"Failed to select the audio device: %@", error.localizedDescription]]);
            }
            return;
        } else {
            // Notify success
            if (callback) {
                callback(@[@YES, @0, @"Audio device selected"]);
            }
        }
        return;
    }

    // Notify success
    if (callback) {
        callback(@[@YES, @0, @"Audio device selected"]);
    }
}

#pragma mark - Audio Route Change Handling
- (void)handleAudioRouteChange:(NSNotification *)notification {
    #if DEBUG
    NSLog(@"[Stringee] Audio route changed");
    #endif
    // Send updated state to Flutter
    [self sendAudioStateUpdate];
}

#pragma mark - Event Broadcast

- (void)sendAudioStateUpdate {
    // Update the current audio route
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    AVAudioSessionRouteDescription *currentRoute = audioSession.currentRoute;

    // Update selectedAudioDevice from current route's outputs
    NSArray<AVAudioSessionPortDescription *> *outputs = currentRoute.outputs;
    if (outputs.count > 0) {
        self.selectedAudioDevice = outputs.firstObject;
    } else {
        self.selectedAudioDevice = nil; // No active output
    }

    // Update the list of available audio devices
    self.availableAudioDevices = [self mergeInputOutputDevices];

    if (self.eventEmitter) {
        // Prepare available devices list
        NSMutableArray *deviceList = [NSMutableArray array];
        for (CustomPortDescription *port in self.availableAudioDevices) {
            [deviceList addObject:@{
                @"uuid": port.UID ?: [NSNull null],
                @"name": port.portName ?: [NSNull null],
                @"type": @([self audioTypeFromPortType:port.portType])
            }];
        }

        // Prepare selected device information
        NSDictionary *selectedDevice = nil;
        if (self.selectedAudioDevice) {
            selectedDevice = @{
                @"uuid": self.selectedAudioDevice.UID ?: [NSNull null],
                @"name": self.selectedAudioDevice.portName ?: [NSNull null],
                @"type": @([self audioTypeFromPortType:self.selectedAudioDevice.portType])
            };
        }

        #if DEBUG
        NSLog(@"[Stringee] current audio device = %@", selectedDevice);
        NSLog(@"[Stringee] available audio devices = %@", deviceList);
        #endif

        // Prepare event data
        NSDictionary *event = @{
            @"selectedAudioDevice": selectedDevice ?: [NSNull null],
            @"availableAudioDevices": deviceList
        };

        // Send event to React Native
        [self.eventEmitter sendEventToReactNative:event];
    }
}

#pragma mark - Private helper functions

- (void)handleSpeakerSelectionWithAudioSession:(AVAudioSession *)audioSession callback:(RCTResponseSenderBlock)callback {
    NSError *error = nil;
    [audioSession overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];

    if (error) {
        if (callback) {
            callback(@[@NO, @-4, [NSString stringWithFormat:@"Failed to set speaker as the audio output: %@", error.localizedDescription]]);
        }
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        if (callback) {
            callback(@[@YES, @0, @"Speaker selected"]);
        }
    });
}

- (NSString *)portTypeFromAudioType:(NSInteger)audioType {
    switch (audioType) {
        case 0:
            return AVAudioSessionPortBuiltInSpeaker;
        case 1:
            return AVAudioSessionPortHeadphones;
        case 2:
            return AVAudioSessionPortBuiltInReceiver;
        case 3:
            return AVAudioSessionPortBluetoothHFP;
        default:
            return nil; // Unknown audio type
    }
}

- (NSArray<CustomPortDescription *> *)mergeInputOutputDevices {

    // Get the current audio route
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    AVAudioSessionRouteDescription *currentRoute = audioSession.currentRoute;

    // Update selected audio device based on the current route
    self.selectedAudioDevice = currentRoute.outputs.firstObject;
    // Update the list of available devices (inputs and outputs merged)
    self.inputDevices = audioSession.availableInputs; // Direct input from AVAudioSession
    self.outputDevices = currentRoute.outputs;        // Current outputs from the route

    // Merge input and output devices into a single list
    NSMutableDictionary<NSString *, CustomPortDescription *> *mergedDevices = [NSMutableDictionary dictionary];
    
    // Add output devices to the merged list
    for (AVAudioSessionPortDescription *outputDevice in self.outputDevices) {
        CustomPortDescription *customDevice = [[CustomPortDescription alloc] initWithPortDescription:outputDevice];
        mergedDevices[outputDevice.UID] = customDevice;
    }
    
    // Add input devices with replacements
    for (AVAudioSessionPortDescription *inputDevice in self.inputDevices) {
        NSString *replacementPortType = nil;
        if ([inputDevice.portType isEqualToString:AVAudioSessionPortBuiltInMic]) {
            replacementPortType = AVAudioSessionPortBuiltInReceiver; // Replace Built-In Mic with Built-In Receiver
        } else if ([inputDevice.portType isEqualToString:AVAudioSessionPortHeadsetMic]) {
            replacementPortType = AVAudioSessionPortHeadphones; // Replace Headset Mic with Headphones
        }
        
        if (replacementPortType) {
            // Create a custom device for the replacement
            CustomPortDescription *customDevice = [[CustomPortDescription alloc] init];
            customDevice.portType = replacementPortType;
            customDevice.portName = inputDevice.portName; // Use the same name
            customDevice.UID = inputDevice.UID; // Use the same UID
            mergedDevices[inputDevice.UID] = customDevice;
        } else {
            // Add the input device as is
            CustomPortDescription *customDevice = [[CustomPortDescription alloc] initWithPortDescription:inputDevice];
            mergedDevices[inputDevice.UID] = customDevice;
        }
    }

    // If we have both Built-In Mic and Built-In Receiver, remove the Built-In Receiver entry
    if ([mergedDevices objectForKey:@"Built-In Microphone"] && [mergedDevices objectForKey:@"Built-In Receiver"]) {
        [mergedDevices removeObjectForKey:@"Built-In Receiver"];
    }

    // Ensure built-in speaker is present in the list
    BOOL builtInSpeakerFound = NO;
    for (AVAudioSessionPortDescription *outputDevice in self.outputDevices) {
        if ([outputDevice.portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            builtInSpeakerFound = YES;
            break;
        }
    }

    if (!builtInSpeakerFound) {
        // Add built-in speaker if not found
        CustomPortDescription *customBuiltInSpeaker = [[CustomPortDescription alloc] initWithPortType:AVAudioSessionPortBuiltInSpeaker portName:@"Built-In Speaker" UID:@"Built-In Speaker"];
        mergedDevices[customBuiltInSpeaker.UID] = customBuiltInSpeaker;
    }

    // #if DEBUG
    // NSLog(@"Input devices = %@", self.inputDevices);
    // NSLog(@"Output devices = %@", self.outputDevices);
    // NSLog(@"Merged devices = %@", mergedDevices);
    // #endif
    
    // Return the merged list of devices as an array
    return mergedDevices.allValues;
}

- (NSInteger)audioTypeFromPortType:(NSString *)portType {
    if ([portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
        return 0; // AudioType.speakerPhone
    } else if ([portType isEqualToString:AVAudioSessionPortHeadphones] ||
               [portType isEqualToString:AVAudioSessionPortLineOut] ||
               [portType isEqualToString:AVAudioSessionPortHeadsetMic]) {
        return 1; // AudioType.wiredHeadset
    } else if ([portType isEqualToString:AVAudioSessionPortBuiltInReceiver] ||
               [portType isEqualToString:AVAudioSessionPortBuiltInMic]) {
        return 2; // AudioType.earpiece
    } else if ([portType isEqualToString:AVAudioSessionPortBluetoothA2DP] ||
               [portType isEqualToString:AVAudioSessionPortBluetoothHFP] ||
               [portType isEqualToString:AVAudioSessionPortBluetoothLE]) {
        return 3; // AudioType.bluetooth
    } else {
        return 4; // AudioType.other
    }
}

@end
