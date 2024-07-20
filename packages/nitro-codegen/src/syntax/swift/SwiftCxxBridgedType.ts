import type { Type } from '../types/Type.js'

export class SwiftCxxBridgedType {
  private readonly type: Type

  constructor(type: Type) {
    this.type = type
  }

  getSwiftCode(): string {
    switch (this.type.kind) {
      case 'enum':
        // Enums cannot be referenced from C++ <-> Swift bi-directionally,
        // so we just pass the underlying raw value (int32).
        return 'Int32'
      default:
        // No workaround - just return normal type
        return this.type.getCode('swift')
    }
  }
  getCppCode(): string {
    switch (this.type.kind) {
      case 'enum':
        return 'int'
      default:
        return this.type.getCode('c++')
    }
  }

  fromCpp(cppParameterName: string): string {
    switch (this.type.kind) {
      case 'enum':
        // Parse a C++ int32 to an Enum because enums cannot be used in C++ <-> Swift.
        return `${this.type.getCode('swift')}(rawValue: ${cppParameterName})!`
      default:
        // No workaround - we can just use the value we get from C++
        return cppParameterName
    }
  }

  toCpp(swiftParameterName: string): string {
    switch (this.type.kind) {
      case 'enum':
        // Return an enum's rawValue (int32) to C++ because enums cannot be used in C++ <-> Swift.
        return `${swiftParameterName}.rawValue`
      default:
        // No workaround - we can just use the value we get from C++
        return swiftParameterName
    }
  }
}
