import type { Platform } from '../getPlatformSpecs.js'
import type { SourceFile } from '../syntax/SourceFile.js'

type AutolinkingFile = Omit<SourceFile, 'language'>

export interface Autolinking {
  platform: Platform
  sourceFiles: AutolinkingFile[]
}
