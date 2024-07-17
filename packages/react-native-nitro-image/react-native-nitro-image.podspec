require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-nitro-image"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/mrousavy/react-native-nitro.git", :tag => "#{s.version}" }

  # VisionCamera Core C++ bindings
  s.source_files = [
    # Generated specs
    "nitrogen/generated/**/*.{h,hpp,c,cpp,swift}",
    # Implementation (Swift)
    "ios/**/*.{swift}",
  ]

  s.pod_target_xcconfig = {
    # Use C++ 17
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    # Enables C++ <-> Swift interop (by default it's only C)
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
  }

  install_modules_dependencies(s)
end
