require "json"

Pod::UI.puts "[Nitro] 🔥 Your app is boosted by nitro!"

DIR = "packages/react-native-nitro-modules"

Pod::Spec.new do |s|
  s.name         = "Nitro"
  s.version      = "0.22.3"
  s.summary      = "Insanely fast native C++, Swift or Kotlin modules with a statically compiled binding layer to JSI."
  s.homepage     = "https://github.com/mrousavy/nitro"
  s.license      = "MIT"
  s.authors      = "Marc Rousavy <me@mrousavy.com> (https://github.com/mrousavy)"
  s.source       = { :git => "https://github.com/mrousavy/nitro.git", :tag => "v0.22.1" }
  s.platforms    = {
    :ios => "12.0",
    :osx => "10.13",
  }
  s.swift_versions = ['5.9']

  s.pod_target_xcconfig = {
    # Use C++ 20
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    # Enables C++ <-> Swift interop (by default it's only C)
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
    # Enables stricter modular headers
    "DEFINES_MODULE" => "YES",
    # C++ compiler flags, mainly for RN version and folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES",
  }

  s.subspec 'Hermes' do |h|
    h.dependency 'hermes-engine'

    h.source_files = [
      # Shared C++ codebase
      "#{DIR}/cpp/**/*.{h,hpp}",
      "#{DIR}/cpp/**/*.{c,cpp}",
      # iOS codebase
      "#{DIR}/ios/**/*.{h,hpp}",
      "#{DIR}/ios/**/*.{c,cpp}",
      "#{DIR}/ios/**/*.{m,mm}",
      "#{DIR}/ios/**/*.swift",
    ]
    h.public_header_files = [
      # Public C++ headers will be exposed in modulemap (for Swift)
      "#{DIR}/cpp/core/AnyMap.hpp",
      "#{DIR}/cpp/core/ArrayBuffer.hpp",
      "#{DIR}/cpp/core/HybridObject.hpp",
      "#{DIR}/cpp/core/Promise.hpp",
      "#{DIR}/cpp/entrypoint/HybridNitroModulesProxy.hpp",
      "#{DIR}/cpp/entrypoint/InstallNitro.hpp",
      "#{DIR}/cpp/registry/HybridObjectRegistry.hpp",
      "#{DIR}/cpp/jsi/JSIConverter.hpp",
      "#{DIR}/cpp/platform/NitroLogger.hpp",
      "#{DIR}/cpp/threading/Dispatcher.hpp",
      "#{DIR}/cpp/utils/NitroHash.hpp",
      "#{DIR}/cpp/utils/NitroDefines.hpp",
      "#{DIR}/cpp/views/CachedProp.hpp",
      # Public iOS-specific headers that will be exposed in modulemap (for Swift)
      "#{DIR}/ios/core/ArrayBufferHolder.hpp",
      "#{DIR}/ios/core/AnyMapHolder.hpp",
      "#{DIR}/ios/core/HybridContext.hpp",
      "#{DIR}/ios/core/PromiseHolder.hpp",
      "#{DIR}/ios/utils/Result.hpp",
      "#{DIR}/ios/utils/RuntimeError.hpp",
      "#{DIR}/ios/utils/SwiftClosure.hpp",
    ]
  end
end
