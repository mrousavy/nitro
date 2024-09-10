---
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

When `HybridMathSpec` is not implemented properly (e.g. if `add(..)` is missing, or if a type is incorrect), **the app will not compile**, which ensures full **type-safety** and **null-safety**.

## Who uses Nitrogen?

Nitrogen should be used by library-authors, and generated specs should be committed to the repository/package.

If you build an app that uses libraries built with Nitro, **you do not need to run nitrogen yourself**.

## Configuration

Nitrogen should be installed as a dev-dependency in the Nitro Module (library).

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>
    ```sh
    npm i nitrogen --save-dev
    ```
  </TabItem>
  <TabItem value="yarn" label="yarn">
    ```sh
    yarn add nitrogen -D
    ```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    ```sh
    pnpm add nitrogen -D
    ```
  </TabItem>
  <TabItem value="bun" label="bun">
    ```sh
    bun i nitrogen -d
    ```
  </TabItem>
</Tabs>

Each Nitro Module needs to have a `nitro.json` configuration file.
Either generate one automatically using `nitrogen`, or create a `nitro.json` yourself manually:

<Tabs>
  <TabItem value="cli-init" label="Create with nitrogen" default>
    Run `nitrogen init` in the root directory of your Nitro Module (next to `package.json`):
    ```sh
    npm run nitrogen init <moduleName>
    ```
  </TabItem>
  <TabItem value="manually" label="Create nitro.json manually">
    Create a `nitro.json` file in the root directory of your Nitro Module (next to `package.json`), and add the following content:
    ```json
    {
      "cxxNamespace": ["math"],
      "ios": {
        "iosModulename": "NitroMath"
      },
      "android": {
        "androidNamespace": ["math"],
        "androidCxxLibName": "NitroMath"
      }
    }
    ```
    Tweak your module name as needed.
  </TabItem>
</Tabs>


## Usage

Nitrogen parses all TypeScript files that end in `.nitro.ts`.

### 1. Write TypeScript specs (JS)

For example, let's create `Math.nitro.ts`:

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  add(a: number, b: number): number
}
```

### 2. Generate native specs (JS -> native)

Now run nitrogen:

```sh
npm run nitrogen
```

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

Note: You should push the files in `nitrogen/generated` to git, and make sure those files are part of your npm package.

### 3. Implement (native)

To implement `Math` now, you just need to implement the spec:

<Tabs groupId="native-language">
  <TabItem value="swift" label="Swift" default>
    ```swift title="HybridMath.swift"
    class HybridMath : HybridMathSpec {
      public func add(a: Double, b: Double) throws -> Double {
        return a + b
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin title="HybridMath.kt"
    class HybridMath : HybridMathSpec() {
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

### 4. Register (native)

Then, register `HybridMath` somewhere on app startup so JS can initialize it.

<Tabs groupId="native-language">
  <TabItem value="swift" label="Swift" default>
    ```swift
    HybridObjectRegistry.registerHybridObjectConstructor("Math") {
      return HybridMath()
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    HybridObjectRegistry.registerHybridObjectConstructor("Math") {
      HybridMath()
    }
    ```
  </TabItem>
  <TabItem value="c++" label="C++">
    ```cpp
    HybridObjectRegistry::registerHybridObjectConstructor(
      "Math",
      []() -> std::shared_ptr<HybridObject> {
        return std::make_shared<HybridMath>();
      }
    );
    ```
  </TabItem>
</Tabs>

### 5. Initialize (TS)

And finally, to initialize `HybridMath` from JS you just need to call `createHybridObject`:

```ts
export const MathModule = NitroModules.createHybridObject<Math>("Math")
const result = MathModule.add(5, 7)
```
