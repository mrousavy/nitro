require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::UI.puts "[NitroModules] Your app is boosted by nitro modules! 🔥"

Pod::Spec.new do |s|
  s.name         = "NitroModules"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/mrousavy/react-native-nitro.git", :tag => "#{s.version}" }

  # VisionCamera Core C++ bindings
  s.source_files = [
    # Shared C++ codebase
    "cpp/**/*.{h,hpp}",
    "cpp/**/*.{c,cpp}",
    # iOS codebase
    "ios/**/*.{h,hpp}",
    "ios/**/*.{c,cpp}",
    "ios/**/*.{m,mm}",
    "ios/**/*.swift",
  ]
  s.public_header_files = [
    # Public C++ headers will be exposed in modulemap (for Swift)
    "cpp/core/AnyMap.hpp",
    "cpp/core/ArrayBuffer.hpp",
    "cpp/core/HybridObject.hpp",
    "cpp/core/Promise.hpp",
    "cpp/registry/HybridObjectRegistry.hpp",
    "cpp/jsi/JSIConverter.hpp",
    "cpp/threading/Dispatcher.hpp",
    "cpp/utils/NitroHash.hpp",
    "cpp/utils/NitroDefines.hpp",
    # Public iOS-specific headers that will be exposed in modulemap (for Swift)
    "ios/core/ArrayBufferHolder.hpp",
    "ios/core/PromiseHolder.hpp",
    "ios/core/HybridContext.hpp",
  ]

  s.pod_target_xcconfig = {
    # Use C++ 20
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    # Enables C++ <-> Swift interop (by default it's only C)
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
  }

  install_modules_dependencies(s)
end
