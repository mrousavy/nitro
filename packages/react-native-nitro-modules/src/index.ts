export * from './createTestObject'
export * from './HybridObject'

type ExtractCreateMethods<T> = {
  [K in keyof T as K extends `create${infer Rest}`
    ? `init${Rest}`
    : never]: T[K]
}

export const NitroModules = {
  get<T>(): ExtractCreateMethods<T> {
    return null as unknown as ExtractCreateMethods<T>
  },
}
