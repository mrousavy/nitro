cmake_minimum_required(VERSION 3.4.1)
project(NitroImage)

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
        cpp-adapter.cpp
        ${shared_files}
        ${android_files}
        "../nitrogen/generated/android/c++/JHybridImage.cpp"
        "../nitrogen/generated/android/c++/JHybridImageFactory.cpp"
)

# TODO: Remove this as NitroModules already depends on fbjni
# Required libs
find_package(fbjni REQUIRED CONFIG)

# Includes all generated specs from Nitrogen
include_directories(
        # Nitrogen generated specs
        "../nitrogen/generated/shared/c++"
        "../nitrogen/generated/android/c++"

        # TODO: Remove hardcoded approach!
        # Hardcoded header paths of NitroModules core
        # Shared C++ includes
        "../../react-native-nitro-modules/cpp/core"
        "../../react-native-nitro-modules/cpp/jsi"
        "../../react-native-nitro-modules/cpp/platform"
        "../../react-native-nitro-modules/cpp/registry"
        "../../react-native-nitro-modules/cpp/test-object"
        "../../react-native-nitro-modules/cpp/threading"
        "../../react-native-nitro-modules/cpp/turbomodule"
        "../../react-native-nitro-modules/cpp/utils"
        # Android-specific C++ includes
        "../../react-native-nitro-modules/src/main/cpp/registry"
        "../../react-native-nitro-modules/src/main/cpp/platform"

)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        android                         # <-- Android JNI core
        fbjni::fbjni                    # <-- Facebook C++ JNI helpers
        react_codegen_NitroModulesSpec  # <-- Generated Specs from CodeGen
)
