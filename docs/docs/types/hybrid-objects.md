---
---

# Other Hybrid Objects (`HybridObject`)

Since Nitro Modules are object-oriented, a `HybridObject` itself is a first-class citizen.
This means you can pass around instances of native `HybridObject`s between JS and native, allowing for safe interface-level abstractions:

<div className="side-by-side-container">
<div className="side-by-side-block">

```ts title="Camera.nitro.ts"
interface Image extends HybridObject {
  readonly width: number
  readonly height: number
}

interface Camera extends HybridObject {
  takePhoto(): Image
}
```

</div>
<div className="side-by-side-block">

```swift title="HybridCamera.swift"
class HybridImage: HybridImageSpec {
  var width: Double { get }
  var height: Double { get }
}

class HybridCamera: HybridCameraSpec {
  func takePhoto() -> HybridImageSpec
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
interface Cropper extends HybridObject {
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
