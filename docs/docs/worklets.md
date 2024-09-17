---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Worklets/Threading

Nitro itself is fully runtime-agnostic, which means every [Hybrid Object](hybrid-object) can be used from any JS Runtime or Worklet Context.

This allows the caller to call into native Nitro Modules from libraries like [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core), or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated).
You can use a Nitro [Hybrid Object](hybrid-object) on the default React JS context, on the UI context, or on any other background worklet context.

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
