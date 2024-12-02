require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

gcc_flags = '$(inherited)'
if ENV['USE_FRAMEWORKS']
  # If building with USE_FRAMEWORKS, folly seems to spazz out.
  # We "fix" this by disabling folly configs.
  gcc_flags << ' FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES'
end

Pod::Spec.new do |s|
  s.name         = "<<iosModuleName>>"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/mrousavy/nitro.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  s.pod_target_xcconfig = {
    # Custom C++ compiler flags
    "GCC_PREPROCESSOR_DEFINITIONS" => gcc_flags
  }

  load 'nitrogen/generated/ios/<<iosModuleName>>+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
