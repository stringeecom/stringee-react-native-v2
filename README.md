# stringee-react-native-v2

## Getting started

### Installation
For Expo project you need to enable and generate the native code in your project by running 

`$ npx expo prebuild`

[More detail about Expo prebuild](https://docs.expo.dev/workflow/prebuild/)

Install `stringee-react-native-v2` by running:

`$ npm install stringee-react-native-v2 --save`

#### iOS

**Note** Please make sure to have [CocoaPods](https://cocoapods.org/) on your computer.
1. In you terminal, change into your `ios` directory.

2. Now run, `pod install`

3. Open XCode

4. Open `<YourProjectName>.xcworkspace` file in XCode. This file can be found in the `ios` folder of your React Native project. 

5. In the "Build Settings" tab -> "Other linker flags" add "$(inherited)" flag.

6. In the "Build Settings" tab -> "Enable bitcode" select "NO".

7. Right-click the information property list file (Info.plist) and select Open As -> Source Code.
8. Insert the following XML snippet into the body of your file just before the final element:

   ```
   <key>NSCameraUsageDescription</key>
   <string>$(PRODUCT_NAME) uses Camera</string>
   <key>NSMicrophoneUsageDescription</key>
   <string>$(PRODUCT_NAME) uses Microphone</string>
   ```

#### Android

##### Proguard
Open up `android/app/proguard-rules.pro` and add following lines: 
```
-dontwarn org.webrtc.**
-keep class org.webrtc.** { *; }
-keep class com.stringee.** { *; }
```

##### Permissions
The Stringee Android SDK requires some permissions from your AndroidManifest
1. Open up `android/app/src/main/AndroidManifest.xml`
2. Add the following lines:
    ```
    // for internet access
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    // for audio access
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    // for camera access
    <uses-permission android:name="android.permission.CAMERA" />
    // for bluetooth 
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    ```

##### Dependencies
1. Open up `android/app/build.gradle`
2. Add the following lines:
    ```
    dependencies {
    ...
    implementation 'com.android.volley:volley:*.*.*'
    ...
    }
    ```
## Migrate to stringee-react-native-v2

To migrate an existing app to stringee-react-native-v2, follow [Migrate to stringee-react-native-v2](https://github.com/stringeecom/stringee-react-native-v2/blob/master/MIGRATEGUIDE.md).

## Version
### Version 1.0.0
##### Features:
- Publish new sdk for react native
