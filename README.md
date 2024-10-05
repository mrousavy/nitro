<a href="https://margelo.io">
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
- [**nitrogen**](packages/nitrogen): A code-generator for nitro module library authors

## Installation

Install [react-native-nitro-modules](https://npmjs.org/react-native-nitro-modules) from npm:
```sh
npm i react-native-nitro-modules
cd ios && pod install
```

## Documentation

- [**Nitro** docs 📚](https://nitro.margelo.com)
- [**Community Discord** 💬](https://discord.gg/6CSHz2qAvA)
- [**nitrogen**/README.md](./packages/nitrogen/README.md)
- [**react-native-nitro-modules**/README.md](./packages/react-native-nitro-modules/README.md)
- [**react-native-nitro-image** example module](./packages/react-native-nitro-image/README.md)

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

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
