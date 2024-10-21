---
---

# Configuration (`nitro.json`)

[Nitrogen](nitrogen) requires a `nitro.json` file to be configured at the root of each [Nitro Module](nitro-modules).

```json
{
  "cxxNamespace": ["<<cxxNamespace>>"],
  "ios": {
    "iosModuleName": "<<iosModuleName>>"
  },
  "android": {
    "androidNamespace": ["<<androidNamespace>>"],
    "androidCxxLibName": "<<androidCxxLibName>>"
  },
  "autolinking": {},
  "ignorePaths": ["node_modules"]
}
```

Nitrogen parses this file with Zod, see [`NitroUserConfig.ts`](https://github.com/mrousavy/nitro/blob/main/packages/nitrogen/src/config/NitroUserConfig.ts) for more information.

## `cxxNamespace`

The `cxxNamespace` is the C++ namespace that all C++ specs will be generated in. It is always relative to `margelo::nitro`, and can also have multiple sub-namespaces:

<div className="side-by-side-container">
  <div className="side-by-side-block">
  ```json
  {
    "cxxNamespace": ["math", "extra"]
  }
  ```
  </div>
  <div className="side-by-side-block">
  ```cpp
  namespace margelo::nitro::math::extra {
    // ...generated classes
  }
  ```
  </div>
</div>

## `ios`

Settings specifically for the iOS platform.

### `iosModuleName`

The `iosModuleName` represents the name of the [clang module](https://clang.llvm.org/docs/Modules.html) that will be emitted by the Swift compiler.
When this Nitro Module is a CocoaPod, this is the same thing as the `<<iosModuleName>>.podspec`'s name:

<div className="side-by-side-container">
  <div className="side-by-side-block">
  ```json
  {
    "ios": {
      "iosModuleName": "NitroMath"
    }
  }
  ```
  </div>
  <div className="side-by-side-block">
  ```ruby title="NitroMath.podspec"
  Pod::Spec.new do |s|
    s.name         = "NitroMath"
    # ...
  ```
  </div>
</div>

## `android`

Settings specifically for the Android platform.

### `androidNamespace`

The `androidNamespace` represents the package namespace in which all Java/Kotlin files are generated and written in.
Similar to the `cxxNamespace`, this is always relative to `margelo.nitro`, and can also have multiple sub-namespaces.

In most cases, you should keep this in sync with the `namespace` specified in your `build.gradle`.

<div className="side-by-side-container">
  <div className="side-by-side-block">
  ```json
  {
    "android": {
      "androidNamespace": ["math", "extra"]
    }
  }
  ```
  </div>
  <div className="side-by-side-block">
  ```kt
  package com.margelo.nitro.image

  // ...
  ```
  </div>
</div>

### `androidCxxLibName`

The `androidCxxLibName` represents the name of the native C++ library that JNI will load to connect Java/Kotlin to C++.

When this Nitro Module is using CMake, this is the same thing as the library defined in `CMakeLists.txt`.
Nitro will load this library at runtime using `System.loadLibrary`.

<div className="side-by-side-container">
  <div className="side-by-side-block">
  ```json
  {
    "android": {
      "androidCxxLibName": "NitroMath"
    }
  }
  ```
  </div>
  <div className="side-by-side-block">
  ```cmake
  project(NitroMath)
  add_library(NitroMath SHARED
          src/main/cpp/cpp-adapter.cpp
          ../cpp/HybridMath.cpp
  )
  ```
  </div>
</div>

## `autolinking`

Contains configuration for all [Hybrid Objects](hybrid-objects) that should be autolinked by Nitrogen.

All Hybrid Objects specified here must follow these requirements:

- They must be default-constructible. That means they need a public constructor that takes zero arguments.
If you have a Hybrid Object that is not default-constructible (e.g. `Image` needs a `path` or `url` argument), consider creating a factory Hybrid Object that can initialize instances of your Hybrid Object internally.
- C++ Hybrid Objects must be declared in a file that has the same name as the Hybrid Object (for `HybridMath`, create `HybridMath.hpp`).
- C++ Hybrid Objects must be scoped in the namespace specified in [`cxxNamespace`](#cxxnamespace).
- Kotlin Hybrid Objects must be inside the package namespace specified in [`androidNamespace`](#androidnamespace).
- Kotlin Hybrid Objects should be annotated with `@DoNotStrip` to prevent them from being compiled out when using ProGuard.

Nitrogen will then generate the following code:

<div className="side-by-side-container">
  <div className="side-by-side-block">
  ```json
  {
    "autolinking": {
      "Math": {
        "cpp": "HybridMath"
      }
    }
  }
  ```
  </div>
  <div className="side-by-side-block">
  ```cpp
  HybridObjectRegistry::registerHybridObjectConstructor(
    "Math",
    []() -> std::shared_ptr<HybridObject> {
      return std::make_shared<HybridMath>();
    }
  );
  ```
  </div>
</div>

Here, the Hybrid Object "`Math`" is autolinked to create an instance of `HybridMath`, a C++ class. Instead of `cpp`, you can also use `swift` or `kotlin`.

## `ignorePaths`

Configures the TypeScript parser to ignore specific given paths when looking for `*.nitro.ts` specs.

By default, this is empty (`[]`), but it can be set to ignore paths like `["node_modules", "lib"]`.
