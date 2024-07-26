cmake_minimum_required(VERSION 3.4.1)
project(NitroModules)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

file(GLOB shared_files
     "../cpp/**/*.cpp"
)
file(GLOB android_files
     "src/main/cpp/**/*.cpp"
)

add_library(NitroModules SHARED
            ${shared_files}
            ${android_files}
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
)
