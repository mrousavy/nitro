import type { Language, Platform } from '../getPlatformSpecs.js'

export interface SourceFile {
  name: string
  content: string
  language: Language
  platform: Platform | 'shared'
}
