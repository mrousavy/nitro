import type { Language } from '../getPlatformSpecs.js'

export interface SourceFile {
  name: string
  content: string
  language: Language
}
