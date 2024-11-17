require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Use GCC_PREPROCESSOR_DEFINITIONS to build static linking
$gcc_shared_flags = "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES"
gcc_flags = ''
$use_frameworks = ENV['USE_FRAMEWORKS']
if $use_frameworks
	gcc_flags = $gcc_shared_flags
end

Pod::Spec.new do |s|
  s.name         = "NitroImage"
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
		"GCC_PREPROCESSOR_DEFINITIONS" => gcc_flags
	}

	load 'nitrogen/generated/ios/NitroImage+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
