project(NitroModules)
cmake_minimum_required(VERSION 3.9.0)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Find all C++ files (shared and platform specifics)
file(GLOB_RECURSE shared_files RELATIVE ${CMAKE_SOURCE_DIR}
     "../cpp/**.cpp"
)
file(GLOB_RECURSE android_files RELATIVE ${CMAKE_SOURCE_DIR}
     "src/main/cpp/**.cpp"
)

# Create library "NitroModules" and add all C++ files to it
add_library(NitroModules SHARED
            ${shared_files}
            ${android_files}
)

# Specifies a path to native header files.
include_directories(
  # Shared C++ includes
  ../cpp/core
  ../cpp/entrypoint
  ../cpp/jsi
  ../cpp/platform
  ../cpp/registry
  ../cpp/prototype
  ../cpp/test-object
  ../cpp/templates
  ../cpp/threading
  ../cpp/turbomodule
  ../cpp/utils
  ../cpp/views
  # Android-specific C++ includes
  src/main/cpp/core
  src/main/cpp/registry
  src/main/cpp/turbomodule
  src/main/cpp/platform
  src/main/cpp/utils
  src/main/cpp/views
)

# Find required libraries
find_library(LOG_LIB log)
find_package(fbjni REQUIRED NitroConfig)
find_package(ReactAndroid REQUIRED NitroConfig)

# Set max page size to 16KB for older NDK versions
if(CMAKE_ANDROID_NDK_VERSION VERSION_LESS "27")
    target_link_options(NitroModules PRIVATE "-Wl,-z,max-page-size=16384")
endif()

# Link all libraries together
target_link_libraries(
        NitroModules
        ${LOG_LIB}                                # <-- Logcat logger
        android                                   # <-- Android JNI core
        fbjni::fbjni                              # <-- Facebook C++ JNI helpers
        ReactAndroid::jsi                         # <-- RN: JSI
)

# Link react-native (different prefab between RN 0.75 and RN 0.76)
if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 76)
    target_link_libraries(
        NitroModules
        ReactAndroid::reactnative                 # <-- RN: Native Modules umbrella prefab
    )
else()
    target_link_libraries(
        NitroModules
        ReactAndroid::react_nativemodule_core     # <-- RN: TurboModules Core
        ReactAndroid::turbomodulejsijni           # <-- RN: TurboModules utils (e.g. CallInvokerHolder)
    )
endif()
