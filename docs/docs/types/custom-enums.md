---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Custom Enums (`A | B`)

There's two different types of enums - [enum](#typescript-enums) and [unions](#typescript-union).

## TypeScript enums

A [TypeScript enum](https://www.typescriptlang.org/docs/handbook/enums.html) is essentially just an object where each key has an incrementing integer value,
so Nitrogen will just generate a C++ enum natively, and bridges to JS using simple integers:

```ts
enum Gender {
  MALE,
  FEMALE
}
interface Person extends HybridObject {
  getGender(): Gender
}
```

This is efficient because `MALE` is the number `0`, `FEMALE` is the number `1`, and all other values are invalid.

## TypeScript union

A [TypeScript union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#intersection-types) is essentially just a string, which is only "typed" via TypeScript.

```ts
type Gender = 'male' | 'female'
interface Person extends HybridObject {
  getGender(): Gender
}
```

Nitrogen statically generates hashes for the strings `"male"` and `"female"` at compile-time, allowing for very efficient conversions between JS `string`s and native `enum`s.
