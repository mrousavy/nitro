---
toc_max_heading_level: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nitrogen

**Nitrogen** is Nitro's code-generator. It parses TypeScript code using an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) parser to generate native interfaces from TypeScript definitions.

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  readonly pi: number
  add(a: number, b: number): number
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridMathSpec.swift (generated)"
protocol HybridMathSpec: HybridObjectSpec {
  var pi: Double { get }
  func add(a: Double, b: Double) -> Double
}
```

</div>
</div>

When `HybridMathSpec` is not implemented properly on the native side (e.g. if `add(..)` is missing, or if a type is incorrect), **the app will not compile**, which ensures full **type-safety** and **null-safety** at compile-time.

## Nitrogen is optional

Nitrogen is a fully optional CLI that does some of the work for you.
You can also build Nitro Modules and create Hybrid Objects without nitrogen, by just calling the `registerHybrids` method yourself.

## Who uses Nitrogen?

Nitrogen should be used by library-authors, and generated specs should be committed to the repository/package.

If you build an app that uses libraries built with Nitro, **you do not need to run nitrogen yourself**.

## Configuration

Nitrogen should be installed as a dev-dependency in the Nitro Module (library).

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>
    ```sh
    npm i nitro-codegen --save-dev
    ```
  </TabItem>
  <TabItem value="yarn" label="yarn">
    ```sh
    yarn add nitro-codegen -D
    ```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    ```sh
    pnpm add nitro-codegen -D
    ```
  </TabItem>
  <TabItem value="bun" label="bun">
    ```sh
    bun i nitro-codegen -d
    ```
  </TabItem>
</Tabs>

:::warning
Nitrogen is currently named `nitro-codegen` instead of `nitrogen` on npm.
:::

Each Nitro Module needs to have a `nitro.json` configuration file.

Create a `nitro.json` file in the root directory of your Nitro Module (next to `package.json`), and add the following content:

```json title="nitro.json"
{
  "cxxNamespace": ["math"],
  "ios": {
    "iosModuleName": "NitroMath"
  },
  "android": {
    "androidNamespace": ["math"],
    "androidCxxLibName": "NitroMath"
  },
  "autolinking": {}
}
```

Tweak your module name and namespaces as needed.

## Usage

Nitrogen parses all TypeScript files that end in `.nitro.ts`.

### 1. Write TypeScript specs

For example, let's create `Math.nitro.ts`:

```ts title="Math.nitro.ts"
interface Math extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  add(a: number, b: number): number
}
```

### 2. Generate native specs

Now run nitrogen:

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>
    ```sh
    npm run nitro-codegen
    ```
  </TabItem>
  <TabItem value="yarn" label="yarn">
    ```sh
    yarn nitro-codegen
    ```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    ```sh
    pnpm nitro-codegen
    ```
  </TabItem>
  <TabItem value="bun" label="bun">
    ```sh
    bun nitro-codegen
    ```
  </TabItem>
</Tabs>

:::warning
Nitrogen is currently named `nitro-codegen` instead of `nitrogen` on npm.
:::

This will generate a single C++ interface by default, which goes into `./nitrogen/generated/`:

```
🔧  Loading nitro.json config...
🚀  Nitrogen runs at ~/Projects/nitro/example/dummy
    🔍  Nitrogen found 1 spec in ~/Projects/nitro/example/dummy
⏳  Parsing Math.nitro.ts...
    ⚙️  Generating specs for HybridObject "Math"...
        shared: Generating C++ code...
⛓️   Setting up build configs for autolinking...
🎉  Generated 1/1 HybridObject in 0.6s!
💡  Your code is in ./nitrogen/generated
‼️  Added 8 files - you need to run `pod install`/sync gradle to update files!
```

Note: You should push the files in `nitrogen/generated/` to git, and make sure those files are part of your npm package.
This way your library will always ship a working package as a whole (including generated interfaces), and the user does not need to do anything else than to install your package.

### 3. Add generated sources to your library

All the generated sources (`nitrogen/generated/`) need to be part of your library's code - so we need to add it to the iOS/Android build files.

<Tabs>
  <TabItem value="template" label="With the Nitro template">

  If you created a library using the [Nitro Module template](https://github.com/mrousavy/nitro/tree/main/packages/template), your library already includes nitrogen's generated sources.

  </TabItem>
  <TabItem value="manually" label="Manually">

  #### iOS

  On iOS, you need to call `add_nitrogen_files(...)` from your library's `.podspec`. Put this **after** any `s.source_files =` calls:
  ```ruby
  load 'nitrogen/generated/ios/NitroExample+autolinking.rb'
  add_nitrogen_files(s)
  ```

  #### Android

  On Android, you first need to add the autogenerated Java/Kotlin sources to your `build.gradle`. Put this at the top of your `build.gradle`, right after any other `apply` calls:

  ```groovy
  apply from: '../nitrogen/generated/android/NitroExample+autolinking.gradle'
  ```

  Then, add the autogenerated C++ sources to your `CMakeLists.txt`. Put this somewhere **after** `add_library(...)`:

  ```cmake
  include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/NitroImage+autolinking.cmake)
  ```
  </TabItem>
</Tabs>

### 4. Implement the Hybrid Objects

To implement `Math` now, you just need to implement the spec:

<Tabs groupId="native-language">
  <TabItem value="swift" label="Swift" default>
    ```swift title="HybridMath.swift"
    class HybridMath : HybridMathSpec {
      var hybridContext = margelo.nitro.HybridContext()
      var memorySize: Int {
        return getSizeOf(self)
      }

      public func add(a: Double, b: Double) throws -> Double {
        return a + b
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin title="HybridMath.kt"
    class HybridMath : HybridMathSpec() {
      override val memorySize: Long
        get() = 0L

      override fun add(a: Double, b: Double): Double {
        return a + b
      }
    }
    ```
  </TabItem>
  <TabItem value="c++" label="C++">
    <div className="side-by-side-container">
      <div className="side-by-side-block">
        ```cpp title="HybridMath.hpp"
        class HybridMath: public HybridMathSpec {
        public:
          double add(double a, double b) override;
        };
        ```
      </div>
      <div className="side-by-side-block">
        ```cpp title="HybridMath.cpp"
        double HybridMath::add(double a, double b) {
          return a + b;
        }
        ```
      </div>
    </div>
  </TabItem>
</Tabs>

### 5. Register the Hybrid Objects

Nitro needs to be able to initialize an instance of your Hybrid Object - so we need to tell it how to do that.
In your `nitro.json`, register `HybridMath` in the `"autolinking"` section:
<Tabs>
  <TabItem value="swift-kotlin" label="Swift/Kotlin" default>
    ```json
    {
      ...
      "autolinking": {
        "Math": {
          "swift": "HybridMath",
          "kotlin": "HybridMath"
        }
      }
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```json
    {
      ...
      "autolinking": {
        "Math": {
          "cpp": "HybridMath"
        }
      }
    }
    ```
  </TabItem>
</Tabs>

Make sure `HybridMath` is default-constructible and scoped inside the correct namespace/package/file, then run Nitrogen.

#### 5.1. Initialize Android (C++)

For Android, you also need to explicitly call `initialize()` in your JNI OnLoad function (most of the time this is inside `cpp-adapter.cpp`):

```cpp title="cpp-adapter.cpp"
#include <jni.h>
#include "NitroMathOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::math::initialize(vm);
}
```

#### 5.2. Initialize Android (Java/Kotlin)

Then, to make sure `JNI_OnLoad` is called, you need to load the C++ library somewhere from your Java/Kotlin code.

<Tabs>
<TabItem value="module" label="Nitro Module (library)">

Inside `NitroMathPackage.java`, add:

```java
public class NitroMathPackage extends TurboReactPackage {
  // ...
  static {
    System.loadLibrary("NitroMath");
  }
}
```

The `NitroMathPackage` will be initialized by React Native's own autolinking system. We just create an empty dummy Package which we use to initialize Nitro instead.

</TabItem>
<TabItem value="app" label="App">

Inside `MainApplication.kt`, add:

```kt
class MainApplication {
  // ...
  companion object {
    init {
      System.loadLibrary("NitroMath")
    }
  }
}
```

</TabItem>
</Tabs>

### 6. Initialize the Hybrid Objects

And finally, to initialize `HybridMath` from JS you just need to call `createHybridObject`:

```ts
export const MathModule = NitroModules.createHybridObject<Math>("Math")
const result = MathModule.add(5, 7)
```
