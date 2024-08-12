/**
 * The [`SWIFT_PRIVATE` clang-attribute](https://github.com/swiftlang/swift/blob/main/docs/CToSwiftNameTranslation.md) prepends two underscores (`__`) to a name, marking it as private.
 */
export function getSwiftPrivateName(name: string): string {
  return `__${name}`
}
