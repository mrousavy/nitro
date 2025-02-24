---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# View Components

Nitro provides first-class support for creating React Native Views.

Such views can be rendered within React Native apps using [Fabric](https://reactnative.dev/architecture/fabric-renderer), and are backed by a C++ ShadowNode.
The key difference to a Fabric view is that it uses Nitro for prop parsing, which is more lightweight, performant and flexible.

:::note
Nitro Views require **react-native 0.78.0** or higher, and require the new architecture.
:::

## Create a Nitro View

### 1. Declaration

To create a new Nitro View, declare it's props and methods in a `*.nitro.ts` file, and create a type that specializes `HybridView<P, M>` - here `HybridView`:

```ts title="Camera.nitro.ts"
import type { HybridView, HybridViewProps, HybridViewMethods } from 'react-native-nitro-modules'

export interface CameraProps extends HybridViewProps {
  enableFlash: boolean
}
export interface CameraMethods extends HybridViewMethods { }

// highlight-next-line
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

Now it's time to implement the View - simply create a new Swift/Kotlin class/file, extend from `HybridCameraViewSpec` and implement your `.enableFlash` property, as well as the common `.view` accessor:

<Tabs groupId="native-view-language">
  <TabItem value="swift" label="Swift" default>
    ```swift title="HybridCameraView.swift"
    class HybridCameraView : HybridCameraViewSpec {
      // Props
      var enableFlash: Bool = false

      // View
      var view: UIView = UIView()
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin title="HybridCameraView.kt"
    class HybridCameraView(val context: ThemedReactContext) : HybridCameraViewSpec() {
      // Props
      override var enableFlash: Boolean = false

      // View
      override val view: View = View(context)
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
export interface ImageProps extends HybridViewProps {
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

### Threading

Since Nitro bridges props directly to JS, you are responsible for ensuring thread-safety.
- If props are set normally via React, they will be set on the UI Thread.
- If the user sets props on the view `hybridRef` (e.g. also if the `HybridView` is passed to a `HybridObject` in native), props _could_ be set on a different Thread, like the JS Thread.

### Before/After update

To batch prop changes, you can override `beforeUpdate()` and `afterUpdate()` in your views:

<Tabs groupId="native-view-language">
  <TabItem value="swift" label="Swift" default>
    ```swift title="HybridCameraView.swift"
    class HybridCameraView : HybridCameraViewSpec {
      // View
      var view: UIView = UIView()

      func beforeUpdate() { }
      func afterUpdate() { }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin title="HybridCameraView.kt"
    class HybridCameraView : HybridCameraViewSpec() {
      // View
      override val view: View = View(NitroModules.applicationContext)

      override fun beforeUpdate() { }
      override fun afterUpdate() { }
    }
    ```
  </TabItem>
</Tabs>

### Callbacks have to be wrapped

Whereas Nitro allows passing JS functions to native code directly, React Native core doesn't allow that. Instead, functions are wrapped in an event listener registry, and a simple boolean is passed to the native side.
Unfortunately React Native's renderer does not allow changing this behaviour, so functions cannot be passed directly to Nitro Views. As a workaround, Nitro requires you to wrap each function in an object, which bypasses React Native's conversion.

So every function (`() => void`) has to be wrapped in an object with one key - `f` - which holds the function: `{ f: () => void }`

```tsx
export interface CameraProps extends HybridViewProps {
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

:::info
We are working on a fix here: [facebook/react #32119](https://github.com/facebook/react/pull/32119)
:::

## Methods

Since every `HybridView` is also a `HybridObject`, methods can be directly called on the object.
Assuming our `<Camera>` component has a `takePhoto()` function like so:

```ts
export interface CameraProps extends HybridViewProps { ... }
export interface CameraMethods extends HybridViewMethods {
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

The `ref` from within `hybridRef`'s callback is pointing to the `HybridObject` directly - you can also pass this around freely.
