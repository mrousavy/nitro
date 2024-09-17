---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Worklets/Threading

Nitro itself is fully runtime-agnostic, which means every [Hybrid Object](hybrid-objects) can be used from any JS Runtime or Worklet Context.

This allows the caller to call into native Nitro Modules from libraries like [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core), or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated).
You can use a Nitro [Hybrid Object](hybrid-objects) on the default React JS context, on the UI context, or on any other background worklet context.

<Tabs groupId="worklet-library">
  <TabItem value="rnwc" label="Worklets Core" default>
  ```ts
  const math = NitroModules.createHybridObject<Math>('Math')
  const boxed = NitroModules.box(math)

  const context = Worklets.createContext('DummyContext')
  context.runAsync(() => {
    'worklet'
    const unboxed = boxed.unbox()
    console.log(unboxed.add(5, 3)) // --> 8
  })
  ```
  </TabItem>
  <TabItem value="rea" label="Reanimated">
  ```ts
  const math = NitroModules.createHybridObject<Math>('Math')
  const boxed = NitroModules.box(math)

  runOnUI(() => {
    'worklet'
    const unboxed = boxed.unbox()
    console.log(unboxed.add(5, 3)) // --> 8
  })()
  ```
  </TabItem>
</Tabs>

## Boxing

Since Nitro uses newer JSI APIs like `jsi::NativeState` - which current worklet libraries (like [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)) do not yet fully support - Hybrid Objects cannot yet be _directly_ used in worklet contexts - they have to be _boxed_.

A _boxed_ Hybrid Object is a native `jsi::HostObject`, which is supported by worklet libraries. The process is as following:

1. In the runtime your `HybridObject` was created in (probably the default runtime), call `NitroModules.box(...)` to box it.
2. The boxed result can be shared in any (worklet-)runtime if needed.
3. To use the original `HybridObject`, simply call `.unbox()` on it in the desired (worklet-)runtime.
4. The result of `.unbox()` is the original `HybridObject` - you can now call any methods on it as usual.

In future versions of [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) we expect fullly automatic `jsi::NativeState` support, which will make boxing obsolete.

## Dispatcher

All synchronous APIs of Nitro work ✨ automagically ✨ on any runtime, but asynchronous APIs (Promises and callbacks) require a `Dispatcher`.
If you call an asynchronous API on a runtime that Nitro doesn't know, it likely doesn't have a `Dispatcher`, so it doesn't know how to call back to the JS Thread after the asynchronous operation has finished (Promise resolve or callback call).

If **you** created that `jsi::Runtime`, you need to create a `Dispatcher` for it and implement `runSync` and `runAsync`:

```cpp
#include <NitroModules/Dispatcher.hpp>
using namespace margelo::nitro;

class MyRuntimeDispatcher: public Dispatcher {
public:
  void runSync(std::function<void()>&& function) override;
  void runAsync(std::function<void()>&& function) override;
};
```

Then, simply install this `Dispatcher` into your runtime so Nitro can use it:

```cpp
auto myDispatcher = std::make_shared<MyRuntimeDispatcher>();
Dispatcher::installRuntimeGlobalDispatcher(myRuntime, myDispatcher);
```

This needs to be done once, ideally immediately as soon as possible after creating the `jsi::Runtime`.

Your `runSync` and `runAsync` implementations must run the given `function` on the same Thread that the `jsi::Runtime` was created on - see [`CallInvokerDispatcher.hpp`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/threading/CallInvokerDispatcher.hpp) for an example.
