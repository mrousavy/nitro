---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using Nitro in a library

Nitro can be used as a simple C++ library in your React Native library, which is very lightweight and simple.

## 1. Create a Nitro Module

First, you need to create a [Nitro Module](nitro-modules) - either by just using the [Nitro Modules template](https://github.com/mrousavy/nitro/tree/main/packages/template), or by just adding `react-native-nitro-modules` to your existing React Native library.

## 2. Create Hybrid Objects

To actually use Nitro, you need to create [Hybrid Objects](hybrid-objects) - either by using Nitro's code-generator CLI “[Nitrogen](nitrogen)”, or by just manually extending the `HybridObject` base class in C++.

## 3. Register Hybrid Objects

Each Hybrid Object you want to initialize from JS has to be registered in Nitro - either by autolinking them with Nitrogen (see [Configuration (Autolinking)](configuration-nitro-json)), or by manually registering the constructors in the [`HybridObjectRegistry`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/registry/HybridObjectRegistry.hpp).

## 4. Use your Hybrid Objects in JS

Lastly, you can initialize and use the registered Hybrid Objects from JS. This is what this will ultimately look like:

```ts
interface Math extends HybridObject {
  add(a: number, b: number): number
}

const math = NitroModules.createHybridObject<Math>("Math")
const value = math.add(5, 7) // --> 12
```
