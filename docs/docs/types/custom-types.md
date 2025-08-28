---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Custom Types (manually written `T`)

The `JSIConverter<T>` is Nitro's implementation for converting JS values to native values, and back.
It's implemented as a C++ template, which allows it to be extended with any custom type.

For example, if you want to use `float` directly you can tell Nitro how to convert a `jsi::Value` to `float` by implementing `JSIConverter<float>`:

```cpp title="JSIConverter+Float.hpp"
namespace margelo::nitro {
  template <>
  struct JSIConverter<float> final {
    static inline float fromJSI(jsi::Runtime&, const jsi::Value& arg) {
      return static_cast<float>(arg.asNumber());
    }
    static inline jsi::Value toJSI(jsi::Runtime&, float arg) {
      return jsi::Value(arg);
    }
    static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
      return value.isNumber();
    }
  };
}
```

Then just use it in your methods:

<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen ✨" default>

    <div className="side-by-side-container">
    <div className="side-by-side-block">

    ```ts title="Math.nitro.ts"
    type Float = CustomType<
      number,
      'float',
      { include: 'JSIConverter+Float.hpp' }
    >
    interface Math extends HybridObject {
      add(a: Float, b: Float): Float
    }
    ```

    </div>
    <div className="side-by-side-block">

    ```cpp title="HybridMath.hpp"
    class HybridMath: public HybridMathSpec {
    public:
      float add(float a, float b) override {
        return a + b;
      }
    };
    ```

    </div>
    </div>

    :::info
    Make sure the `JSIConverter+Float.hpp` header is included in your project's user-search-path so it can be included.
    :::

  </TabItem>
  <TabItem value="manually" label="Manually">

    ```cpp title="HybridMath.hpp"
    #include "JSIConverter+Float.hpp"
    // ...
    class HybridMath : public HybridObject {
    public:
      float add(float a, float b) {
        return a + b;
      }

      void loadHybridMethods() {
        HybridObject::loadHybridMethods();
        registerHybrids(this, [](Prototype& prototype) {
          prototype.registerHybridMethod("add", &HybridMath::add);
        });
      }
    }
    ```

    :::info
    Make sure the compiler knows about `JSIConverter<float>` at the time when `HybridMath` is declared, so import your `JSIConverter+Float.hpp` in your Hybrid Object's header file as well!
    :::

  </TabItem>
</Tabs>

## Complex types (e.g. `struct`)

The same goes for any complex type, like a custom typed `struct`:

```cpp title="JSIConverter+Person.hpp"
struct Person {
  std::string name;
  double age;
};

namespace margelo::nitro {
  template <>
  struct JSIConverter<Person> {
    static Person fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return Person(
        JSIConverter<std::string>::fromJSI(runtime, obj.getProperty(runtime, "name")),
        JSIConverter<double>::fromJSI(runtime, obj.getProperty(runtime, "age"))
      );
    }
    static jsi::Value toJSI(jsi::Runtime& runtime, const Person& arg) {
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "name", JSIConverter<std::string>::toJSI(runtime, arg.name));
      obj.setProperty(runtime, "age", JSIConverter<double>::toJSI(runtime, arg.age));
      return obj;
    }
    static bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject())
        return false;
      jsi::Object obj = value.getObject(runtime);
      if (!JSIConverter<std::string>::canConvert(runtime, obj.getProperty(runtime, "name")))
        return false;
      if (!JSIConverter<double>::canConvert(runtime, obj.getProperty(runtime, "age")))
        return false;
      return true;
    }
  };
}
```

..which can now safely be called with any JS value.
If the given JS value is not an object of exactly the shape of `Person` (that is, a `name: string` and an `age: number` values), Nitro will throw an error.

## Foreign types (e.g. `react::ShadowNodeWrapper`)

Since you have full control over the conversion part, you can even safely use foreign types like React Native's core types. For example, let's use `react::ShadowNodeWrapper`, which is stored as a `jsi::NativeState` on a `jsi::Object`:

```cpp title="JSIConverter+ShadowNode.hpp"
namespace margelo::nitro {
  using ShadowNode = std::shared_ptr<react::ShadowNodeWrapper>;

  template <>
  struct JSIConverter<ShadowNode> {
    static ShadowNode fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return obj.getNativeState<react::ShadowNodeWrapper>(runtime);
    }
    static jsi::Value toJSI(jsi::Runtime& runtime, ShadowNode arg) {
      jsi::Object obj(runtime);
      obj.setNativeState(runtime, arg);
      return obj;
    }
    static bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject())
        return false;
      return value.hasNativeState<react::ShadowNode>(runtime);
    }
  };
}
```

Then just use it in your methods:

<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen ✨" default>

    <div className="side-by-side-container">
    <div className="side-by-side-block">

    ```ts title="MyHybrid.nitro.ts"
    type ShadowNode = CustomType<
      {},
      'std::shared_ptr<react::ShadowNodeWrapper>',
      { include: 'JSIConverter+ShadowNode.hpp' }
    >
    interface MyHybrid extends HybridObject {
      doSomething(view: ShadowNode): void
    }
    ```

    </div>
    <div className="side-by-side-block">

    ```cpp title="MyHybrid.hpp"
    class MyHybrid: public MyHybridSpec {
      void doSomething(std::shared_ptr<react::ShadowNodeWrapper> view) override {
        // ...
      }
    };
    ```

    </div>
    </div>

    :::info
    Make sure the `JSIConverter+ShadowNode.hpp` header is included in your project's user-search-path so it can be included.
    :::

  </TabItem>
  <TabItem value="manually" label="Manually">

    ```cpp title="MyHybrid.hpp"
    #include "JSIConverter+ShadowNode.hpp"
    // ...

    class MyHybrid: public MyHybridSpec {
      void doSomething(std::shared_ptr<react::ShadowNode> view) override {
        // ...
      }
    };
    ```

    :::info
    Make sure the compiler knows about `JSIConverter<ShadowNode>` at the time when `MyHybrid` is declared, so import your `JSIConverter+ShadowNode.hpp` in your Hybrid Object's header file as well!
    :::

  </TabItem>
</Tabs>
