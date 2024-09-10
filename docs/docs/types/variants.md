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
