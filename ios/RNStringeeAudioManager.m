//
//  RNStringeeAudioManager.m
//  RNStringee
//
//  Created by StringeeTeam on 6/20/25.
//  Copyright © 2025 Stringee. All rights reserved.
//

#import "RNStringeeAudioManager.h"
#import <AVFoundation/AVFoundation.h>

@interface CustomPortDescription : NSObject
@property (nonatomic, copy) NSString *portType;
@property (nonatomic, copy) NSString *portName;
@property (nonatomic, copy) NSString *UID;

- (instancetype)initWithPortDescription:(AVAudioSessionPortDescription *)portDescription;
- (instancetype)initWithPortType:(NSString *)portType portName:(NSString *)portName UID:(NSString *)UID;

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

- (void)dealloc {
    [self stopAudioManager];
}

#pragma mark - Audio Manager Methods

- (void)startAudioManager {
    // Add notification observer for route changes
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleAudioRouteChange:)
                                                 name:AVAudioSessionRouteChangeNotification
                                               object:nil];

    #if DEBUG
    NSLog(@"[Stringee] Audio manager started");
    #endif

    // Send initial state
    [self sendAudioStateUpdate];
}

- (void)stopAudioManager {
    // Remove notification observer for route changes
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:AVAudioSessionRouteChangeNotification
                                                  object:nil];
    
    // Optionally, reset selected audio device and available devices
    self.selectedAudioDevice = nil;
    self.inputDevices = nil;
    self.outputDevices = nil;
    self.availableAudioDevices = nil;

    #if DEBUG
    NSLog(@"[Stringee] Audio manager stopped");
    #endif
}

- (void)selectAudioDevice:(NSDictionary *)deviceInfo {
    NSNumber *portTypeCode = deviceInfo[@"type"];
    NSString *portType = [self portTypeFromCode:[portTypeCode integerValue]];
    NSString *deviceUID = deviceInfo[@"uuid"];
    
    #if DEBUG
    NSLog(@"[Stringee] current audio device = %@", self.selectedAudioDevice);
    NSLog(@"[Stringee] Selecting audio device: %@", deviceInfo);
    #endif

    // Check if the device is already selected
    if (self.selectedAudioDevice && [self.selectedAudioDevice.UID isEqualToString:deviceUID]) {
        #if DEBUG
        NSLog(@"[Stringee] Audio device already selected");
        #endif
        return;
    }

    // Check if the device is built-in speaker
    if ([portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
        // Set speaker as the audio output
        AVAudioSession *audioSession = [AVAudioSession sharedInstance];
        [self handleSpeakerSelection:audioSession];
        return;
    }

    // Get available inputs
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    NSArray<AVAudioSessionPortDescription *> *availableInputs = audioSession.availableInputs;

    // Check if the device is available in inputs
    AVAudioSessionPortDescription *deviceInput = nil;
    for (AVAudioSessionPortDescription *input in availableInputs) {
        if ([input.UID isEqualToString:deviceUID]) {
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
            #if DEBUG
            NSLog(@"[Stringee] Failed to select the audio device: %@", error.localizedDescription);
            #endif
        }
        return;
    }

    #if DEBUG
    NSLog(@"[Stringee] Audio device selected");
    #endif
}

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

    // Check if type of selectedDevice in deviceList
    for (NSDictionary *device in deviceList) {
        if ([device[@"type"] isEqual:@([self audioTypeFromPortType:self.selectedAudioDevice.portType])]) {
            selectedDevice = device;
            break;
        }
    }

    #if DEBUG
    NSLog(@"[Stringee] current audio device = %@", selectedDevice);
    NSLog(@"[Stringee] available audio devices = %@", self.availableAudioDevices);
    #endif

    // Prepare event data
    NSDictionary *audioState = @{
        @"device": selectedDevice ?: [NSNull null],
        @"devices": deviceList
    };

    // Notify delegate
    if (self.delegate && [self.delegate respondsToSelector:@selector(audioManager:didUpdateAudioState:)]) {
        [self.delegate audioManager:self didUpdateAudioState:audioState];
    }
}

#pragma mark - Audio Route Change Handling

- (void)handleAudioRouteChange:(NSNotification *)notification {
    #if DEBUG
    NSLog(@"[Stringee] Audio route changed");
    #endif
    // Send updated state
    [self sendAudioStateUpdate];
}

#pragma mark - Private Helper Methods

- (void)handleSpeakerSelection:(AVAudioSession *)audioSession {
    NSError *error = nil;
    [audioSession overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];

    if (error) {
        #if DEBUG
        NSLog(@"[Stringee] Failed to set speaker as the audio output: %@", error.localizedDescription);
        #endif
        return;
    }

    #if DEBUG
    NSLog(@"[Stringee] Speaker selected");
    #endif
}

- (NSString *)portTypeFromCode:(NSInteger)code {
    switch (code) {
        case 0:
            return AVAudioSessionPortBuiltInSpeaker;
        case 1:
            return AVAudioSessionPortHeadphones;
        case 2:
            return AVAudioSessionPortBuiltInReceiver;
        case 3:
            return AVAudioSessionPortBluetoothHFP;
        default:
            return nil; // Unknown port type
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
