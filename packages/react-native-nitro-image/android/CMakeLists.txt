project(NitroImage)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME NitroImage)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/NitroImage+autolinking.cmake)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
        ../cpp/HybridTestObject.cpp
)

# Set up local includes
include_directories(
        "src/main/cpp"
        "../cpp"
)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        android                                   # <-- Android core
)
