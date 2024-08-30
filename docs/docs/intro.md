---
---

# What is Nitro?

Nitro is a framework for building native modules in React Native.

- A **Nitro Module** is a library built with Nitro.
- A **Hybrid Object** is a native object in Nitro, implemented in either C++, Swift or Kotlin.
- **Nitrogen** is a code-generator a library author can use to generate native bindings from a custom TypeScript interface.

## Other frameworks

### Turbo Modules

React Native's standard framework for building native modules is "Turbo Modules".
Nitro is pretty similar to Turbo, with a few fundamental differences:

- Code Generator
  - Both Turbo and Nitro have a code generator which generates native code/interfaces from TypeScript sources.
  - Nitro supports

### Expo Modules

Expo's recommended approach of building native modules is called "Expo Modules".

### Supported Types

<table>
  <tr>
    <th>JS Type</th>
    <th>Expo Modules</th>
    <th>Turbo Modules</th>
    <th>Nitro Modules</th>
  </tr>
  <tr>
    <td><code>number</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>boolean</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>string</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>bigint</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>object</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>T?</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>T[]</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>Promise&lt;T&gt;</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; void</code></td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>(T...) =&gt; R</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>[A, B, C, ...]</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>A | B | C | ...</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>Record&lt;string, T&gt;</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td><code>ArrayBuffer</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>HybridObject</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>interface</code></td>
    <td>❌</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>enum</code></td>
    <td>❌</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>..any <code>union</code></td>
    <td>❌</td>
    <td>❌</td>
    <td>✅</td>
  </tr>
</table>

### Benchmarks

<table>
  <tr>
    <th></th>
    <th>ExpoModules</th>
    <th>TurboModules</th>
    <th>NitroModules</th>
  </tr>
  <tr>
    <td>100.000x <code>addNumbers(...)</code></td>
    <td>404.95ms</td>
    <td>108.84ms</td>
    <td><b>7.25ms</b></td>
  </tr>
  <tr>
    <td>100.000x <code>addStrings(...)</code></td>
    <td>420.69ms</td>
    <td>169.84ms</td>
    <td><b>30.71ms</b></td>
  </tr>
</table>
