import type { Type } from '../types/Type.js'

export function getJniType(type: Type): string {
  switch (type.kind) {
    default:
      return type.getCode('c++')
  }
}
