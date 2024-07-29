cmake_minimum_required(VERSION 3.4.1)
project(NitroModules)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Find all C++ files (shared and platform specifics)
file(GLOB shared_files
     "../cpp/**/*.cpp"
)
file(GLOB android_files
     "src/main/cpp/**/*.cpp"
)

# Create library "NitroModules" and add all C++ files to it
add_library(NitroModules SHARED
            ${shared_files}
            ${android_files}
            JNIOnLoad.cpp
)

# Specifies a path to native header files.
include_directories(
  # Shared C++ includes
  ../cpp/core
  ../cpp/jsi
  ../cpp/platform
  ../cpp/registry
  ../cpp/test-object
  ../cpp/threading
  ../cpp/turbomodule
  ../cpp/utils
  # Android-specific C++ includes
  src/main/cpp/registry
  src/main/cpp/platform
)

# Allow importing Nitro TurboModule from elsewhere (e.g. the CLI)
target_include_directories(NitroModules PUBLIC ../cpp/turbomodule)

# Find required libraries
find_library(log-lib log)
find_package(fbjni REQUIRED CONFIG)

# Link all libraries together
target_link_libraries(
        NitroModules
        ${log-lib}                      # <-- Logcat logger
        android                         # <-- Android JNI core
        fbjni::fbjni                    # <-- Facebook C++ JNI helpers
        react_codegen_NitroModulesSpec  # <-- Generated Specs from CodeGen
)
