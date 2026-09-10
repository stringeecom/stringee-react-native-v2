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
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/stringeecom/stringee-react-native-v2.git", :tag => s.version.to_s }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React-Core", ">= 0.60.0"
  s.dependency "Stringee", '2.0.2'
end
