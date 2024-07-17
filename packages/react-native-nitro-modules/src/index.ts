export * from './createTestObject'
export * from './HybridObject'

type ExtractConstructors<T> = {
  [K in keyof T as K extends `constructor` ? `create` : never]: T[K]
}

export const NitroModules = {
  get<T>(): ExtractConstructors<T> {
    return null as unknown as ExtractConstructors<T>
  },
}
