---
---

# Tuples (`[A, B, ...]`)

A Tuple is a fixed-length set of items of the given types. Example:

```ts
type Point = [number, number]
interface Math extends HybridObject {
  distance(a: Point, b: Point): number
}
```

Tuples can also have different types per value:

```ts
type Good = [number, string, Person]
type Bad = (number | string | Person)[]
interface Test extends HybridObject {
  good(values: Good): void
  bad(values: Bad): void
}
```

The tuple "`Good`" in the example above is better and more efficient than "`Bad`" because it's length is known at compile-time,
each parameter is type-safe (`Good[0] = number`, `Bad[0] = number | string | Person`), and it doesn't use variants.
