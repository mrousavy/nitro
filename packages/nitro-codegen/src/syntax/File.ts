import type { Language } from '../getPlatformSpecs.js'

export interface File {
  name: string
  content: string
  language: Language
}
