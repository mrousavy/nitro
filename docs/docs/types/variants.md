---
---

# Variants (`A | B | ...`)

A Variant is a type of either one of the values defined in it's declaration. Example:

```ts
interface Math extends HybridObject {
  distance(value: number | Point): number
}
```

:::tip
While variants are still very efficient, they need runtime-checks for type conversions,
which comes with a tiny overhead compared to all other statically defined types. If possible, **avoid variants**.
:::

## Custom Alias Names

Each variant is a unique type in Swift/Kotlin. For `string | number`, a variant's name could be `Variant_String_Double`.

Since the generated names are hard to read, you can choose to give variants a custom alias name instead by declaring it as an extra `type` alias:

```ts
export type MathOutput = string | number
export interface Math extends HybridObject<{ ios: 'swift' }> {
  calculate(): MathOutput
}
```

This will then use the easier-to-read type-alias name instead of `Variant_String_Double`:

```swift title="nitrogen/generated/ios/HybridMathSpec.swift"
public protocol HybridMathSpec: HybridObject {
  // diff-remove
  func calculate() -> Variant_String_Double
  // diff-add
  func calculate() -> MathOutput
}
```
