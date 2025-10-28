<a href="https://margelo.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/static/img/banner-nitro-modules-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/static/img/banner-nitro-modules-light.png" />
    <img alt="Nitro Modules" src="./docs/static/img/banner-nitro-modules-light.png" />
  </picture>
</a>

<br />

**Nitro Modules** are highly efficient native modules with a statically compiled binding layer to JSI, and typesafe JS bindings.
It consists of two parts:

- [**react-native-nitro-modules**](packages/react-native-nitro-modules): The core C++ library powering all nitro modules
- [**nitrogen**](packages/nitrogen): An optional code-generator for nitro module library authors

## Example

Declaration (TypeScript):
```ts
export interface Math extends HybridObject<{ ios: 'c++' }> {
  add(a: number, b: number): number
}
```

Implementation (C++, Swift or Kotlin):
```cpp
class HybridMath: public HybridMathSpec {
public:
  HybridMath(): HybridObject(TAG) {}
  double add(double a, double b) override {
    return a + b;
  }
}
```

Usage (TypeScript):
```ts
import { NitroModules } from 'react-native-nitro-modules'

const math = NitroModules.createHybridObject<Math>('Math')
const result = math.add(5, 3)
```

## Installation

Install [react-native-nitro-modules](https://npmjs.org/react-native-nitro-modules) from npm:
```sh
npm i react-native-nitro-modules
cd ios && pod install
```

## Documentation

- [**Nitro** docs 📚](https://nitro.margelo.com)
- [**Community Discord** 💬](https://margelo.com/discord)
- [**Nitro Module Builder** AI GPT 🤖](https://chatgpt.com/g/g-6870125d0fcc8191925bd20a02c78bcf-nitro-module-builder)
- [**How to build a Nitro Module** YouTube Tutorial ▶️](https://youtu.be/528SxTGnIlc?si=IxH7n09ZVe4iwRPv)
- [**nitrogen**/README.md](./packages/nitrogen/README.md)
- [**react-native-nitro-modules**/README.md](./packages/react-native-nitro-modules/README.md)
- [**react-native-nitro-test** example module](./packages/react-native-nitro-test/README.md)
- [`TestObject.nitro.ts` example playground](./packages/react-native-nitro-test/src/specs/TestObject.nitro.ts)

## Supported Platforms

### Cross-platform

Cross-platform native modules can be built with C++.
Any custom C++ types can be used and bridged to JS with minimal overhead.

JS <-> C++ type converters are statically generated ahead of time - no more dynamic lookups or runtime parser errors! 🥳

### iOS

iOS native modules and view components can be written either in pure C++, or pure Swift.
Thanks to Swift 5.9, Swift Nitro Modules [bridge directly to C++](https://www.swift.org/documentation/cxx-interop/) instead of going through Objective-C message sends. Woohoo, no more Objective-C, and **zero overhead** C++ -> Swift calls! 🥳

### Android

Android native modules and view components can be written either in pure C++, or pure Kotlin/Java.
Thanks to fbjni, even complex types can be effortlessly bridged to Kotlin/Java with minimal overhead! 🔥

## Margelo

Nitro is built with ❤️ by Margelo.
We build fast and beautiful apps. Contact us at [margelo.com](https://margelo.com) for consultancy services.

## Contributing

See the [contributing guide](https://nitro.margelo.com/docs/contributing) to learn how to contribute to the repository and the development workflow.

## License

MIT
