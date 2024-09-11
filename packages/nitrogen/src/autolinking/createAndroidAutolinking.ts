import type { SourceFile, SourceImport } from '../syntax/SourceFile.js'
import { createCMakeExtension } from './android/createCMakeExtension.js'
import { createGradleExtension } from './android/createGradleExtension.js'
import type { Autolinking } from './Autolinking.js'

interface JNIHybridRegistration {
  sourceImport: SourceImport
  registrationCode: string
}

interface AndroidAutolinking extends Autolinking {
  jniHybridRegistrations: JNIHybridRegistration[]
}

export function createAndroidAutolinking(
  allFiles: SourceFile[]
): AndroidAutolinking {
  const cmakeExtension = createCMakeExtension(allFiles)
  const gradleExtension = createGradleExtension()

  return {
    platform: 'android',
    jniHybridRegistrations: [],
    sourceFiles: [cmakeExtension, gradleExtension],
  }
}
