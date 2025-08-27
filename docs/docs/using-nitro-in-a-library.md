---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using Nitro in a library

Nitro can be used as a simple lightweight C++/Swift/Kotlin dependency in your React Native library.

## 1. Create a Nitro Module

First, you need to create a [Nitro Module](nitro-modules) - either by just using the [Nitro Modules template](https://github.com/mrousavy/nitro/tree/main/packages/template), or by just adding `react-native-nitro-modules` to your existing React Native library.

## 2. Create Hybrid Objects

To actually use Nitro, you need to create [Hybrid Objects](hybrid-objects) - either by using Nitro's code-generator CLI “[Nitrogen](nitrogen)”, or by just manually extending the `HybridObject` base class in C++.

## 3. Register Hybrid Objects

Each Hybrid Object you want to initialize from JS has to be registered in Nitro - either by autolinking them with Nitrogen (see [Configuration (Autolinking)](configuration-nitro-json#autolinking)), or by manually registering the constructors in the [`HybridObjectRegistry`](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-modules/cpp/registry/HybridObjectRegistry.hpp).

## 4. Use your Hybrid Objects in JS

Lastly, you can initialize and use the registered Hybrid Objects from JS. This is what this will ultimately look like:

```ts
interface Math extends HybridObject {
  add(a: number, b: number): number
}

const math = NitroModules.createHybridObject<Math>("Math")
const value = math.add(5, 7) // --> 12
```

## 5. Run it

To test the library you just created, you now need to set up an example app for it.
There's multiple different ways to set up a react-native app nowadays, either via Expo, RN CLI, or bare brownfield iOS/Android apps.

For example, to create a new Expo app, run `create-expo-app`:

```sh
npx create-expo-app@latest
```

Then add the Nitro Module you created in step 1 as a local library (aka _linking it_), and run it.
