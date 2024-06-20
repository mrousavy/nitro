require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::UI.puts "[NitroModules] Your app is boosted by nitro modules! 🔥"

Pod::Spec.new do |s|
  s.name         = "react-native-nitro-modules"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/mrousavy/react-native-nitro.git", :tag => "#{s.version}" }

  s.subspec 'C++-Bindings' do |ss|
    # VisionCamera Core C++ bindings
    ss.source_files = [
      "cpp/**/*.{h,c}",
      "cpp/**/*.{hpp,cpp}"
    ]
    ss.public_header_files = [
      "cpp/**/*.h"
    ]
  end

  s.subspec 'Swift-Bindings' do |ss|
    # VisionCamera Swift bindings
    ss.source_files = [
      "ios/**/*.swift",
      "ios/**/*.modulemap",
    ]

    ss.dependency "react-native-nitro-modules/C++-Bindings"
  end

  # Enables C++ <-> Swift interop (by default it's only C)
  s.pod_target_xcconfig = {
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
  }

  install_modules_dependencies(s)
end
