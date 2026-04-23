---
---

# Variants (`A | B | ...`)

A Variant is a type of either one of the values defined in its declaration. Example:

```ts
interface Math extends HybridObject<{ … }> {
  distance(value: number | Point): number
}
```

:::tip
While variants are still very efficient, they need runtime-checks for type conversions,
which comes with a tiny overhead compared to all other statically defined types. If possible, **avoid variants**.
:::

## Variants with String Enums

Variants can contain [string enums (unions)](custom-enums#typescript-union) alongside other types like `boolean` or `number`:

```ts
type Status = 'pending' | 'complete' | 'failed'

interface Task extends HybridObject<{ … }> {
  getStatus(): boolean | Status
}
```

This generates a proper variant type (`std::variant<bool, Status>` in C++) where `Status` is preserved as an enum.

You can also combine multiple string enums in a single variant:

```ts
type Color = 'red' | 'green' | 'blue'
type Size = 'small' | 'medium' | 'large'

interface Item extends HybridObject<{ … }> {
  getAttribute(): Color | Size
}
```

:::warning
String enums in the same variant must have **distinct values**. Overlapping values (e.g., both enums containing `'default'`) will cause an error because Nitrogen cannot determine which enum a shared value belongs to at runtime.
:::

## No inline literal values

A variant can only consist of types, not of inline literal values.

```ts
export interface Person extends HybridObject<{ … }> {
  // diff-remove
  getGender(): 'male' | 'female'
}
```

If you need variants of literal values, you probably want to use [an enum (_union_)](custom-enums#typescript-union) instead.


## Custom Alias Names

Each variant is a unique type in Swift/Kotlin - for example: `string | number` becomes `Variant_String_Double`.

Since the generated names are hard to read, it is recommended to declare type-aliases with custom names instead:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Bad ❌"

interface Math extends HybridObject<{ … }> {
  calculate(): string | number
}
```

</div>
<div className="side-by-side-block">

```ts title="Good ✅"
type MathOutput = string | number
interface Math extends HybridObject<{ … }> {
  calculate(): MathOutput
}
```

</div>
</div>

This will then use the easier-to-read type-alias name instead of `Variant_String_Double`:

```swift title="nitrogen/generated/ios/HybridMathSpec.swift"
public protocol HybridMathSpec: HybridObject {
  // diff-remove
  func calculate() -> Variant_String_Double
  // diff-add
  func calculate() -> MathOutput
}
```
