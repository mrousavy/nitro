---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# View Components

Nitro provides first-class support for creating React Native Views.

Such views can be rendered within React Native apps using [Fabric](https://reactnative.dev/architecture/fabric-renderer), and are backed by a C++ ShadowNode.
The key difference to a Fabric view is that it uses Nitro for prop parsing, which is more lightweight, performant and flexible.

:::note
Nitro Views require **react-native 0.78.0** or higher.
:::

## Create a Nitro View

### 1. Declaration

To create a new Nitro View, declare it's props and methods in a `*.nitro.ts` file, and export your `HybridView` type:

```ts title="Camera.nitro.ts"
import type { HybridView } from 'react-native-nitro-modules'

export interface CameraProps {
  enableFlash: boolean
}
export interface CameraMethods { }

export type CameraView = HybridView<CameraProps, CameraMethods>
```

### 2. Code Generation

Then, run [nitrogen](nitrogen):

<Tabs groupId="package-manager">
  <TabItem value="npm" label="npm" default>
    ```sh
    npx nitro-codegen
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

This will create a C++ ShadowNode, with an iOS (Swift) and Android (Kotlin) interface, just like any other [Hybrid Object](hybrid-objects).
Additionally, a view config (`CameraViewConfig.json`) will be generated - this is required by Fabric.

### 3. Implementation

Now it's time to implement the View - simply create a new Swift/Kotlin file and extend from `HybridCameraViewSpec`:

<Tabs groupId="native-view-language">
  <TabItem value="swift" label="Swift" default>
    ```swift title="HybridCameraView.swift"
    class HybridCameraView : HybridCameraViewSpec {
      // Props
      var isBlue: Bool = false

      // View
      var view: UIView = UIView()
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin title="HybridCameraView.kt"
    class HybridCameraView : HybridCameraViewSpec() {
      // Props
      override var enableFlash: Boolean = false

      // View
      override val view: View = View(NitroModules.applicationContext)
    }
    ```
  </TabItem>
</Tabs>

### 4. Autolink

Just like any other Hybrid Object, add the Hybrid View to your `nitro.json`'s autolinking configuration:

```json title="nitro.json"
{
  // ...
  "autolinking": {
    "CameraView": {
      "swift": "HybridCameraView",
      "kotlin": "HybridCameraView"
    }
  }
}
```

Now run nitrogen again.

### 5. Initialization

Then, to use the view in JavaScript, use `getHostComponent(..)`:

```ts
import { getHostComponent } from 'react-native-nitro-modules'
import CameraViewConfig from '../nitrogen/generated/shared/json/CameraViewConfig.json'

export const Camera = getHostComponent<CameraProps, CameraMethods>(
  'Camera',
  () => CameraViewConfig
)
```

### 6. Rendering

And finally, render it:

```jsx
function App() {
  return <Camera enableFlash={true} />
}
```

## Props

Since every `HybridView` is also a `HybridObject`, you can use any type that Nitro supports as a property - including custom types (`interface`), `ArrayBuffer`, and even other `HybridObject`s!

For example, a custom `<ImageView>` component can be used to render custom `Image` types:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Image.nitro.ts"
export interface Image extends HybridObject {
  readonly width: number
  readonly height: number
  save(): Promise<string>
}
```

</div>
<div className="side-by-side-block">

```ts title="ImageView.nitro.ts"
import { type Image } from './Image.nitro.ts'
export interface ImageProps {
  image: Image
}
export type ImageView = HybridView<ImageProps>
```

</div>
</div>

Then;

```jsx
function App() {
  const image = await loadImage('https://...')
  return <ImageView image={image} />
}
```

### Callbacks have to be wrapped

React Native's renderer uses "events" for callbacks. Each event is registered on the native side, and then dispatched using their internal event dispatcher.

Nitro works differently; every callback is a first-class citizen and can be passed to native directly - using the language native function types (`std::function<void()>`, `() -> Void`, ...).

Due to React Native's design decision, functions cannot be passed directly to the C++ ShadowNode. As a workaround, Nitro requires you to wrap each function in an object, which bypasses React Native's conversion.

So every function (`() => void`) has to be wrapped in an object with one key - `f` - which holds the function: `{ f: () => void }`

```tsx
export interface CameraProps {
  onCaptured: (image: Image) => void
}
export type CameraView = HybridView<CameraProps>

function App() {
  // diff-remove
  return <Camera onCaptured={(i) => console.log(i)} />
  // diff-add
  return <Camera onCaptured={{ f: (i) => console.log(i) }} />
}
```

## Methods

Since every `HybridView` is also a `HybridObject`, methods can be directly called on the object.
Assuming our `<Camera>` component has a `takePhoto()` function like so:

```ts
export interface CameraProps { ... }
export interface CameraMethods {
  takePhoto(): Promise<Image>
}

export type CameraView = HybridView<CameraProps, CameraMethods>
```

To call the function, you would need to get a reference to the `HybridObject` first using `hybridRef`:

```jsx
function App() {
  return (
    <Camera
      hybridRef={{
        f: (ref) => {
          const image = ref.takePhoto()
        }
      }}
    />
  )
}
```

> Note: If you're wondering about the `{ f: ... }` syntax, see ["Callbacks have to be wrapped"](#callbacks-have-to-be-wrapped).
