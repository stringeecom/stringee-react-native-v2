require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNStringee"
  s.version      = package["version"]
  s.summary      = "RNStringee"
  s.description  = <<-DESC
                  The Stringee platform makes it easy to embed high-quality interactive video, voice, SMS into web and mobile apps.
                   DESC
  s.homepage     = "https://stringee.com"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.author       = { "Stringee" => "info@stringee.com" }
  s.platform     = :ios, "15.0"
  s.source       = { :git => "https://github.com/stringeecom/stringee-react-native-v2.git", :tag => s.version.to_s }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React-Core", ">= 0.60.0"
  # Stringee iOS SDK 2.2.0 is not published to CocoaPods trunk. The host Podfile must add:
  # pod 'Stringee', :podspec => 'https://raw.githubusercontent.com/stringeecom/Stringee-iOS-SDK/2.2.0/Stringee.podspec'
  s.dependency "Stringee", '2.2.0'
end
