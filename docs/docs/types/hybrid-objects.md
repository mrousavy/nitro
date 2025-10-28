---
---

# Other Hybrid Objects (`HybridObject`)

Since Nitro Modules are object-oriented, a `HybridObject` itself is a first-class citizen.
This means you can pass around instances of native `HybridObject`s between JS and native, allowing for safe interface-level abstractions:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Camera.nitro.ts"
interface Image
  extends HybridObject<{ ios: 'swift' }> {
  readonly width: number
  readonly height: number
}

interface Camera
  extends HybridObject<{ ios: 'swift' }> {
  takePhoto(): Image
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridCamera.swift"
class HybridImage: HybridImageSpec {
  let uiImage: UIImage
  var width: Double { uiImage.size.width }
  var height: Double { uiImage.size.height }
}

class HybridCamera: HybridCameraSpec {
  func takePhoto() -> HybridImageSpec {
    return HybridImage(uiImage: …)
  }
}
```

</div>
</div>

## Interface-level abstraction

Since Hybrid Objects are declared as interfaces, `Image` could have different implementations...

```swift
class HybridUIImage: HybridImageSpec {
  // ...
  var uiImage: UIImage
}
class HybridCGImage: HybridImageSpec {
  // ...
  var cgImage: CGImage
}
class HybridBufferImage: HybridImageSpec {
  // ...
  var gpuBuffer: CMSampleBuffer
}
```

...but still be used exactly the same in other places, as it is all a `HybridImageSpec`.
Even if they use different implementations under the hood, they all share a common interface with properties like `width`, `height` and more:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Cropper.nitro.ts"
interface Cropper
  extends HybridObject<{ ios: 'swift' }> {
  crop(image: Image, size: Size): Image
}
```

</div>
<div className="side-by-side-block">

```swift title="Cropper.swift"
class HybridCropper: HybridCropperSpec {
  func crop(image: HybridImageSpec,
            size: Size) -> HybridImageSpec {
    let data = image.data
    let croppedData = cropFunc(data, size)
    return HybridCGImage(data: croppedData)
  }
}
```

</div>
</div>

## `AnyHybridObject`

If you don't need a specific type of `HybridObject` but instead just want any `HybridObject`, you can use Nitro's `AnyHybridObject` type.
This type only works in C++.

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Some.nitro.ts"
import {
  HybridObject,
  AnyHybridObject
} from 'react-native-nitro-modules'

interface Some
  extends HybridObject<{ ios: 'c++' }> {
  something(obj: AnyHybridObject): void
}
```

</div>
<div className="side-by-side-block">

```cpp title="HybridSome.hpp"
class HybridSome: public HybridSomeSpec {
public:
  void something(
    const std::shared_ptr<HybridObject>& obj
  ) override;
};
```

</div>
</div>
