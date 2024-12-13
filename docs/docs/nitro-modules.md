---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nitro Modules

A **Nitro Module** is a library built with Nitro. It may contain one or more [**Hybrid Objects**](hybrid-objects).

## Structure

A Nitro Module contains the usual react-native library structure, with `ios/` and `android/` folders, a `package.json`, and a `*.podspec` file for iOS.
In addition to the base react-native library template, a Nitro Module also contains:

- A TypeScript setup
- A `nitro.json` configuration file

## Creating a Nitro Module

### 1. Initialize the template

To create a new Nitro Module, simply run `nitro-codegen init <moduleName>`:

```sh
npx nitro-codegen@latest init react-native-math
```

### 2. Set up an example app

After creating a Nitro Module, it's time to set up an example app to test your library:

<Tabs groupId="expo-or-bare">
  <TabItem value="expo" label="Expo" default>
  ```sh
  npx create-expo-app@latest
  ```
  </TabItem>
  <TabItem value="bare" label="Bare RN">
  ```sh
  npx @react-native-community/cli@latest init NitroMathExample
  ```
  </TabItem>
</Tabs>

### 3. Implement your Hybrid Objects

Once you set up the library, you can start implementing your Hybrid Objects!


<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen ✨" default>

  With [Nitrogen](nitrogen) you can ✨ automagically ✨ generate all native interfaces from your TypeScript definitions.
  After implementing the generated specs, register them using the `HybridObjectRegistry`.

  See [Hybrid Objects (Implementation)](hybrid-objects#implementation) for more information.

  </TabItem>
  <TabItem value="manually" label="Manually">

  If you don't want to use Nitrogen, simply create your native C++ classes that inherit from `HybridObject`, and register them using the `HybridObjectRegistry`.

  See [Hybrid Objects (Implementation)](hybrid-objects#implementation) for more information.

  </TabItem>
</Tabs>

:::tip
In a future version of Nitro, [Nitrogen](nitrogen) will be able to bootstrap a Nitro Module template with a simple command to avoid this manual configuration.
:::
