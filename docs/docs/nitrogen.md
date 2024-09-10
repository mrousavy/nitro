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


## Run it

Nitrogen parses all TypeScript files that end in `.nitro.ts`. For example, let's create `Math.nitro.ts`:

```ts title="Math.nitro.ts"
interface Math extends HybridObject {
  add(a: number, b: number): number
}
```

Now run nitrogen:

```sh
npm run nitrogen
```
