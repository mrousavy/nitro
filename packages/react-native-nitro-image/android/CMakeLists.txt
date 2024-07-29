cmake_minimum_required(VERSION 3.4.1)
project(NitroImage)

set (PACKAGE_NAME NitroImage)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Find all C++ files (shared and platform specifics)
file(GLOB shared_files
        "../nitrogen/generated/android/c++/**/*.cpp"
)
file(GLOB android_files
        "../nitrogen/generated/shared/c++/**/*.cpp"
)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        cpp-adapter.cpp
        ${shared_files}
        ${android_files}
)

# Includes all generated specs from Nitrogen
include_directories(
        "../nitrogen/generated/shared/c++"
        "../nitrogen/generated/android/c++"
)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        android                         # <-- Android JNI core
        react_codegen_NitroModulesSpec  # <-- Generated Specs from CodeGen
)
