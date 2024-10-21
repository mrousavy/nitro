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

### 1. Download the template

The **mrousavy/nitro** repository contains a template ([`packages/template`](https://github.com/mrousavy/nitro/tree/main/packages/template)) which can be used to create a new Nitro Module:

```sh
git clone https://github.com/mrousavy/nitro /tmp/nitro
cp -R /tmp/nitro/packages/template my-new-library
```

### 2. Replace all placeholders

You need to replace all `<<*>>` placeholders and filenames for each value in `nitro.json`. For example, `<<iosModuleName>>` can be replaced with `NitroMath`:

```ruby title="NitroMath.podspec"
...
Pod::Spec.new do |s|
// diff-remove
  s.name         = "<<iosModuleName>>"
// diff-add
  s.name         = "NitroMath"
...
```

### 3. Set up an example app

After properly creating a Nitro Module, it's time to set up an example app to test your library:

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

### 4. Implement your Hybrid Objects

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
