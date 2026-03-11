---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Contributing

If you encounter issues with Nitro, want to fix a bug, or reproduce a bug in the example app, you'd need to clone the repo and get it running first.

The nitro repo is a Bun monorepo, and is set up like this:

- `example/`: A react-native app that uses `react-native-nitro-modules` and `react-native-nitro-test`.
- `packages/`
  - `/nitrogen/`: The Node app that generates Nitro bindings. On npm, it is called `nitrogen`.
  - `/react-native-nitro-modules/`: The core Nitro Modules library which contains mostly C++ code.
  - `/react-native-nitro-test/`: An example Nitro Module library that contains a lot of test code.
  - `/template/`: A template for a Nitro Module library.

## Run Nitro Example

### 1. Set up your development environment

You need:

- [Bun](https://bun.sh)
- [CocoaPods](https://cocoapods.org)
- Xcode 16.4 or higher
- Android Studio

### 2. Clone the repo

Clone [mrousavy/**nitro**](https://github.com/mrousavy/nitro) using git, and navigate into the `nitro` folder using Terminal.

### 3. Install dependencies

Using Bun, install all required dependencies:

```sh
bun install
bun run build
```

#### 3.1. (Optional) Install iOS dependencies

If you want to work on the iOS codebase, you also need to install the Pods:

```sh
cd example
bundle install
bun pods
```

### 4. Run the app

After installing all dependencies, you can run the React Native app in `example/`:

<Tabs groupId="platform">
  <TabItem value="ios" label="iOS" default>
    1. Open `example/ios/NitroExample.xcworkspace` in Xcode
    2. Select your target (iPhone Simulator)
    3. Click Run
  </TabItem>
  <TabItem value="android" label="Android">
    1. Open `example/android` in Android Studio
    2. Click Gradle Sync
    3. Click Run
  </TabItem>
</Tabs>

## Reproduce something in the Nitro Example app

With most issue reports, it is required to reproduce the issue in the Nitro example app (`example/`).
Whether it's a build error, a nitrogen error, or a runtime error, there needs to be a way to reproduce it here.
Usually, you can reproduce issues like this:

1. Fork the repository
2. Change the code to reproduce the issue
3. Create a PR to the **nitro** repository which demonstrates the issue

### Reproduce a build error

If you encounter a build error, compare your setup to the setup in `example/`.
For example, if you have a different setting in your `Podfile`, try changing it here in Nitro `example/` as well to see if it builds here. Submit a PR with the change required to make it fail, and see if the CI fails to build.

### Reproduce a nitrogen bug

The Nitro `example/` app uses a Nitro Module (`packages/react-native-nitro-test/`) which acts as an example contains a lot of test code, like `src/specs/TestObject.nitro.ts` ([link](https://github.com/mrousavy/nitro/blob/main/packages/react-native-nitro-test/src/specs/TestObject.nitro.ts)). If you change something in `TestObject.nitro.ts`, make sure to run nitrogen:

```sh
bun nitro-test specs
```

### Reproduce a runtime error

Submit a PR to the nitro repository that demonstrates this runtime error or crash in the Nitro `example/` app.

## Run Nitro Docs

The Nitro docs ([nitro.margelo.com](https://nitro.margelo.com)) are built with [Docusaurus](https://docusaurus.io).

To run the Nitro docs, follow these steps:

### 1. Install dependencies

Navigate into the `docs/` folder, and install all dependencies:

```sh
cd docs
bun install
```

### 2. Run docs (dev)

Then, just run the docs development server using the docusaurus command:

```sh
bun start
```

## Linting

We value code quality and consistent styling.

For JS/TS, we use ESLint and Prettier:

```sh
bun lint
```

For C++, we use clang-format:

```sh
bun lint-cpp
```

For Swift, we use swift format:

```sh
bun lint-swift
```

For Kotlin, we use ktlint:

```sh
bun lint-kotlin
```

Make sure to lint your files everytime before creating a PR. This is also enforced in the CI, but linting beforehand also applies auto-fixes.
