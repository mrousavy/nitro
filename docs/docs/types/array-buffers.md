---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ArrayBuffers (`ArrayBuffer`)

Array Buffers allow highly efficient access to the same data from both JS and native.
Passing an `ArrayBuffer` from native to JS and back does not involve any copies, and is therefore the fastest way of passing around data in Nitro.

<Tabs>
  <TabItem value="ts" label="TypeScript" default>
    ```ts
    interface Image extends HybridObject {
      getData(): ArrayBuffer
    }
    ```
  </TabItem>
  <TabItem value="cpp" label="C++">
    ```cpp
    class HybridImage: public HybridImageSpec {
      std::shared_ptr<ArrayBuffer> getData();
    }
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    class HybridImage: HybridImageSpec {
      func getData() -> ArrayBufferHolder
    }
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    class HybridImage: HybridImageSpec() {
      fun getData(): ArrayBuffer
    }
    ```
  </TabItem>
</Tabs>

It is important to understand the ownership, and threading concerns around such shared memory access.

## Ownership

- An `ArrayBuffer` that was created on the native side is **owning**, which means you can safely access it's data as long as the `ArrayBuffer` reference is alive.
It can be safely held strong for longer, e.g. as a class property/member, and accessed from different Threads.

  ```swift
  func doSomething() -> ArrayBufferHolder {
    let buffer = ArrayBufferHolder.allocate(1024 * 10)
    let data = buffer.data   // <-- ✅ safe to do because we own it!
    self.buffer = buffer     // <-- ✅ safe to do to use it later!
    DispatchQueue.global().async {
      let data = buffer.data // <-- ✅ also safe because we own it!
    }
    return buffer
  }
  ```

- An `ArrayBuffer` that was received as a parameter from JS cannot be safely kept strong as the JS VM can delete it at any point, hence it is **non-owning**.
It's data can only be safely accessed before the synchronous function returned, as this will stay within the JS bounds.

  ```swift
  func doSomething(buffer: ArrayBufferHolder) {
    let data = buffer.data   // <-- ✅ safe to do because we're still sync
    DispatchQueue.global().async {
      // code-error
      let data = buffer.data // <-- ❌ NOT safe
    }
  }
  ```
  If you need a non-owning buffer's data for longer, **copy it first**:
  ```swift
  func doSomething(buffer: ArrayBufferHolder) {
    let copy = ArrayBufferHolder.copy(of: buffer)
    DispatchQueue.global().async {
      let data = copy.data // <-- ✅ safe now because we have a owning copy
    }
  }
  ```

## Threading

An `ArrayBuffer` can be accessed from both JS and native, and even from multiple Threads at once, but they are **not thread-safe**.
To prevent race conditions or garbage-data from being read, make sure to not read from- and write to- the `ArrayBuffer` at the same time.

## Creating Buffers

Buffers can either be created from native (**owning**), or from JS (**non-owning**).

### `NativeArrayBuffer`

On the native side, an **owning** `ArrayBuffer` can either **wrap-**, or **copy-** an existing buffer:

<Tabs>
  <TabItem value="cpp" label="C++">
    ```cpp
    auto myData = new uint8_t*[4096];

    // wrap (no copy)
    auto wrappingArrayBuffer = ArrayBuffer::wrap(myData, 4096, [=]() {
      delete[] myData;
    });
    // copy
    auto copiedArrayBuffer = ArrayBuffer::copy(myData, 4096);
    // new blank buffer
    auto newArrayBuffer = ArrayBuffer::allocate(4096);
    ```
  </TabItem>
  <TabItem value="swift" label="Swift">
    ```swift
    let myData = UnsafeMutablePointer<UInt8>.allocate(capacity: 4096)

    // wrap (no copy)
    let wrappingArrayBuffer = ArrayBuffer.wrap(dataWithoutCopy: myData,
                                               size: 4096,
                                               onDelete: { myData.deallocate() })
    // copy
    let copiedArrayBuffer = ArrayBuffer.copy(of: wrappingArrayBuffer)
    // new blank buffer
    let newArrayBuffer = ArrayBuffer.allocate(size: 4096)
    ```
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">
    ```kotlin
    val myData = ByteBuffer.allocateDirect(4096)

    // wrap (no copy)
    val wrappingArrayBuffer = ArrayBuffer.wrap(myData)


    // copy
    let copiedArrayBuffer = ArrayBuffer.copy(myData)
    // new blank buffer
    val newArrayBuffer = ArrayBuffer.allocate(4096)
    ```
  </TabItem>
</Tabs>

### `JSArrayBuffer`

From JS, a **non-owning** `ArrayBuffer` can be created via the [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) web APIs, and viewed or edited using the typed array APIs (e.g. [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)).

```ts
const arrayBuffer = new ArrayBuffer(4096)
const view = new Uint8Array(arrayBuffer)
view[0] = 64
view[1] = 128
view[2] = 255
```
