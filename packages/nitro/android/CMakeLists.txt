project(Nitro)
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

# Create library "Nitro" and add all C++ files to it
add_library(Nitro SHARED
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
  ../cpp/utils
  ../cpp/views
  # Android-specific C++ includes
  src/main/cpp/core
  src/main/cpp/registry
  src/main/cpp/platform
  src/main/cpp/utils
)

# Find required libraries
find_library(LOG_LIB log)
find_package(fbjni REQUIRED NitroConfig)

# Link all libraries together
target_link_libraries(
        Nitro
        ${LOG_LIB}                                # <-- Logcat logger
        android                                   # <-- Android JNI core
        fbjni::fbjni                              # <-- Facebook C++ JNI helpers
)
