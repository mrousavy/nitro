import { NitroConfig } from '../../config/NitroConfig.js'
import { indent, toUnixPath } from '../../utils.js'
import {
  createFileMetadataString,
  getRelativeDirectory,
  getRelativeDirectoryGenerated,
  isCppFile,
  isNotDuplicate,
} from '../../syntax/helpers.js'
import type { SourceFile } from '../../syntax/SourceFile.js'

export interface CMakeFile extends Omit<SourceFile, 'language'> {
  language: 'cmake'
}

export function createCMakeExtension(files: SourceFile[]): CMakeFile {
  const name = NitroConfig.getAndroidCxxLibName()
  const sharedFiles = files
    .filter((f) => f.platform === 'shared' && isCppFile(f))
    .map((f) => getRelativeDirectory(f))
    .map((p) => toUnixPath(p))
    .filter(isNotDuplicate)
  const androidFiles = files
    .filter((f) => f.platform === 'android' && isCppFile(f))
    .map((f) => getRelativeDirectory(f))
    .map((p) => toUnixPath(p))
    .filter(isNotDuplicate)
  const autolinkingFilePath = getRelativeDirectoryGenerated(
    'android',
    `${name}OnLoad.cpp`
  )
  const autolinkingFile = toUnixPath(autolinkingFilePath)

  const code = `
${createFileMetadataString(`${name}+autolinking.cmake`, '#')}

# This is a CMake file that adds all files generated by Nitrogen
# to the current CMake project.
#
# To use it, add this to your CMakeLists.txt:
# \`\`\`cmake
# include(\${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/${name}+autolinking.cmake)
# \`\`\`

# Add all headers that were generated by Nitrogen
include_directories(
  "../nitrogen/generated/shared/c++"
  "../nitrogen/generated/android/c++"
  "../nitrogen/generated/android/"
)

# Add all .cpp sources that were generated by Nitrogen
target_sources(
  # CMake project name (Android C++ library name)
  ${name} PRIVATE
  # Autolinking Setup
  ${autolinkingFile}
  # Shared Nitrogen C++ sources
  ${indent(sharedFiles.join('\n'), '  ')}
  # Android-specific Nitrogen C++ sources
  ${indent(androidFiles.join('\n'), '  ')}
)

# Add all libraries required by the generated specs
find_package(fbjni REQUIRED) # <-- Used for communication between Java <-> C++
find_package(ReactAndroid REQUIRED) # <-- Used to set up React Native bindings (e.g. CallInvoker/TurboModule)
find_package(react-native-nitro-modules REQUIRED) # <-- Used to create all HybridObjects and use the Nitro core library

# Link all libraries together
target_link_libraries(
        ${name}
        fbjni::fbjni                              # <-- Facebook C++ JNI helpers
        ReactAndroid::jsi                         # <-- RN: JSI
        react-native-nitro-modules::NitroModules  # <-- NitroModules Core :)
)

# Link react-native (different prefab between RN 0.75 and RN 0.76)
if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 76)
    target_link_libraries(
        ${name}
        ReactAndroid::reactnative                 # <-- RN: Native Modules umbrella prefab
    )
else()
    target_link_libraries(
        ${name}
        ReactAndroid::react_nativemodule_core     # <-- RN: TurboModules Core
    )
endif()
  `.trim()
  return {
    content: code,
    language: 'cmake',
    name: `${name}+autolinking.cmake`,
    platform: 'android',
    subdirectory: [],
  }
}
