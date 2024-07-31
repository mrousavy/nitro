project(NitroImage)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME NitroImage)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Find all C++ files (shared and platform specifics)
file(GLOB shared_files
        "../nitrogen/generated/shared/c++/**/*.cpp"
)
file(GLOB android_files
        "../nitrogen/generated/android/c++/**/*.cpp"
)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
        ${shared_files}
        ${android_files}
        ../cpp/HybridTestImpl.cpp
        ../nitrogen/generated/shared/c++/HybridImage.cpp
        ../nitrogen/generated/shared/c++/HybridImageFactory.cpp
        ../nitrogen/generated/shared/c++/HybridTestObject.cpp
        ../nitrogen/generated/android/c++/JHybridImage.cpp
        ../nitrogen/generated/android/c++/JHybridImageFactory.cpp
)

# Required libs
find_package(fbjni REQUIRED NitroConfig)
find_package(react-native-nitro-modules REQUIRED NitroConfig)
find_package(ReactAndroid REQUIRED NitroConfig)

# Includes all generated specs from Nitrogen
include_directories(
        # Nitrogen generated specs
        "../nitrogen/generated/shared/c++"
        "../nitrogen/generated/android/c++"
        "../cpp"

)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        android                                   # <-- Android JNI core
        fbjni::fbjni                              # <-- Facebook C++ JNI helpers
        ReactAndroid::jsi                         # <-- RN: JSI
        ReactAndroid::react_nativemodule_core     # <-- RN: TurboModules Core
        react-native-nitro-modules::NitroModules  # <-- NitroModules Core :)
)
