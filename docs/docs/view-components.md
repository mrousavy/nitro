---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# View Components

As of today, Nitro does not yet provide first-class support for view components.
There are ongoing efforts to bring first-class support for view components, which would also go through the Nitro typing system.
This requires coordination with Meta as this requires APIs to be made public in react-native core.

## Workaround via native

As a temporary workaround, you could create a Hybrid Object that acts as your view manager, which you can then natively access via some sort of global map.

### 1. Create your View (props)

First, create your view using Turbo Modules (Fabric) or Expo Modules. Let's build a custom Image component:

```tsx title="App.tsx"
function App() {
  return (
    <NitroImage
      image={someImage}
      opacity={0.5}
    />
  )
}
```

`opacity` is a number which can be represented using Turbo-/Expo-Modules, but `image` is a custom Hybrid Object from Nitro.
This can not be handled by Turbo-/Expo-Modules, so we cannot simply pass the props as-is to the native view:

```ts
interface NativeProps extends ViewProps {
  opacity: number
  image: Image
// code-error
//       ^ Error: `Image` is not supported by Turbo-/Expo-Modules!
}
```

Instead of declaring props for the view component like usual, we want to route everything through Nitro - which is faster and supports more types.
For this, we'll only create one prop for our view which will be used to connect the Turbo-/Expo-View with our Nitro View Manager - let's call it `nitroId`:

```ts
interface NativeProps extends ViewProps {
// diff-remove
  opacity: number
// diff-remove
  image: Image
// diff-add
  nitroId: number
}
```

### 2. Implement your view

Now implement your view using Turbo-/Expo-Modules like usual. It only has one React prop: `nitroId`.
Follow the respective guides to implement this view.

Make sure the view can be mounted on screen, and `nitroId` properly updates the native property:

```tsx
function App() {
  return <NitroImage nitroId={13} />
}
```

### 3. Generate `nitroId` in JS

In the JS implementation of `<NitroImage>`, we now need to generate unique `nitroId` values per instance:

```tsx title="NitroImage.tsx
const NativeNitroImageView = /* From Turbo-/Expo- APIs */

let nitroIdCounter = 0
export function NitroImage() {
  const nitroId = useMemo(() => nitroIdCounter++, [])

  return <NativeNitroImageView nitroId={nitroId} />
}
```

### 4. Register the native view in a global map

To allow your Nitro Hybrid Object to find the Turbo-/Expo-View, we need to throw it into some kind of global map, index by `nitroId`.
It is up to the developer on how to handle this most efficiently, but here's an example:

<Tabs groupId="native-platform-language">
  <TabItem value="objc" label="iOS (Objective-C)" default>
    ```objc
    @implementation NitroImageView

    // Global map of nitroId to view instances
    + (NSMapTable<NSNumber*, NitroImageView*>*) globalViewsMap {
      static NSMapTable<NSNumber*, NitroImageView*>* _map;
      if (_map == nil) {
        _map = [NSMapTable strongToWeakObjectsMapTable];
      }
      return _map;
    }

    // Override `nitroId` setter to throw `self` into global map
    - (void)setNitroId:(NSNumber*)nitroId {
      [self.globalViewsMap setObject:self forKey:nitroId];
    }

    @end
    ```
  </TabItem>
  <TabItem value="kotlin" label="Android (Kotlin)">
    ```kotlin
    class NitroImageView {
      companion object {
        // Global map of nitroId to view instances
        val globalViewsMap = HashMap<Double, WeakReference<NitroImageView>>()
      }

      // Override `nitroId` setter to throw `this` into global map
      fun setNitroId(nitroId: Double) {
        globalViewsMap.put(nitroId, WeakReference(this))
      }
    }
    ```
  </TabItem>
</Tabs>


### 5. Create a custom view manager with Nitro

Fasten your seatbelts and get ready for Nitro: We now want a Nitro Hybrid Object that acts as a binding between our JS view, and the actual native Swift/Kotlin view.

```ts title="NitroImageViewManager.nitro.ts"
export interface Image extends HybridObject {
  // ...
}

export interface NitroImageViewManager extends HybridObject {
  image: Image
  opacity: number
}
```

Now implement `NitroImageViewManager` in Swift and Kotlin, and assume it has to be created with a valid `NitroImageView` instance:

<Tabs>
  <TabItem value="swift" label="iOS (Swift)" default>
    ```swift
    class HybridNitroImageViewManager: HybridNitroImageViewManagerSpec {
      private let view: NitroImageView
      init(withView view: NitroImageView) {
        self.view = view
      }

      var image: Image {
        get { return view.image }
        set { view.image = newValue }
      }
      var opacity: Double {
        get { return view.opacity }
        set { view.opacity = newValue }
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Android (Kotlin)">
    ```kotlin
    class HybridNitroImageViewManager: HybridNitroImageViewManagerSpec() {
      private val view: NitroImageView
      constructor(view: NitroImageView) {
        this.view = view
      }

      override var image: Image
        get() = view.image
        set(newValue) = view.image = newValue
      override var opacity: Double {
        get() = view.opacity
        set(newValue) = view.opacity = newValue
    }
    ```
  </TabItem>
</Tabs>


### 6. Connect the Nitro view manager to the native View

To actually create instances of `HybridNitroImageViewManager`, we need to first find the view for the given `nitroId`. For that, we created a helper `NitroImageViewManagerRegistry`:

```ts
export interface NitroImageViewManagerRegistry extends HybridObject {
  createViewManager(nitroId: number): NitroImageViewManager
}
```

..which we need to implement in native:

<Tabs>
  <TabItem value="swift" label="iOS (Swift)" default>
    ```swift
    class HybridNitroImageViewManagerRegistry: HybridNitroImageViewManagerRegistrySpec {
      func createViewManager(nitroId: Double) -> NitroImageViewManagerSpec {
        let view = NitroImage.globalViewsMap.object(forKey: nitroId)
        return HybridNitroImageViewManager(withView: view)
      }
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Android (Kotlin)">
    ```kotlin
    class HybridNitroImageViewManagerRegistry: HybridNitroImageViewManagerRegistrySpec() {
      fun createViewManager(nitroId: Double): NitroImageViewManagerSpec {
        val view = NitroImage.globalViewsMap.get(nitroId)
        return HybridNitroImageViewManager(view.value)
      }
    }
    ```
  </TabItem>
</Tabs>

### 7. Use the view manager from JS:

After setting up those bindings, we can now route all our props through Nitro - which makes prop updating faster, and allows for more types!

```tsx title="NitroImage.tsx
const NativeNitroImageView = /* From Turbo-/Expo- APIs */
const NitroViewManagerFactory = NitroModules.createHybridObject("NitroViewManagerFactory")

let nitroIdCounter = 0
export function NitroImage(props: NitroImageProps) {
  const nitroId = useMemo(() => nitroIdCounter++, [])
  const nitroViewManager = useRef<NitroViewManager>(null)

  useEffect(() => {
    // Create a View Manager for the respective View (looked up via `nitroId`)
    nitroViewManager.current = NitroViewManagerFactory.createViewManager(nitroId)
  }, [nitroId])

  useEffect(() => {
    // Update props through Nitro - this natively sets them on the view as well.
    nitroViewManager.current.image = props.image
    nitroViewManager.current.opacity = props.opacity
  }, [props.image, props.opacity])

  return <NativeNitroImageView nitroId={nitroId} />
}
```
