---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Custom Types (...any `T`)

<Tabs groupId="nitrogen-or-not">
  <TabItem value="nitrogen" label="With Nitrogen ✨" default>


    Nitrogen can ✨**automagically**✨ generate custom types and their respective bindings for any types used in your specs.

    ## Custom interfaces (structs)

    Any custom `interface` or `type` will be represented as a fully type-safe `struct` in C++/Swift/Kotlin. Simply define the type in your `.nitro.ts` spec:

    <div className="side-by-side-container">
    <div className="side-by-side-block">

    ```ts title="Nitro.nitro.ts"
    interface Person {
      name: string
      age: number
    }

    interface Nitro extends HybridObject {
      getAuthor(): Person
    }
    ```

    </div>
    <div className="side-by-side-block">

    ```swift title="HybridNitro.swift"
    class HybridNitro: HybridNitroSpec {
      func getAuthor() -> Person {
        return Person(name: "Marc", age: 24)
      }
    }



    ```

    </div>
    </div>

    Nitro enforces full type-safety to avoid passing or returning wrong types.
    Both `name` and `age` are always part of `Person`, they are never a different type than a `string`/`number`, and never null or undefined.

    This makes the TypeScript definition the **single source of truth**, allowing you to rely on types! 🤩

    ## Enums (TypeScript enum)

    A [TypeScript enum](https://www.typescriptlang.org/docs/handbook/enums.html) is essentially just an object where each key has an incrementing integer value,
    so Nitrogen will just generate a C++ enum natively, and bridges to JS using simple integers:

    ```ts
    enum Gender {
      MALE,
      FEMALE
    }
    interface Person extends HybridObject {
      getGender(): Gender
    }
    ```

    This is efficient because `MALE` is the number `0`, `FEMALE` is the number `1`, and all other values are invalid.

    ## Enums (TypeScript union)

    A [TypeScript union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#intersection-types) is essentially just a string, which is only "typed" via TypeScript.

    ```ts
    type Gender = 'male' | 'female'
    interface Person extends HybridObject {
      getGender(): Gender
    }
    ```

    Nitrogen statically generates hashes for the strings `"male"` and `"female"` at compile-time, allowing for very efficient conversions between JS `string`s and native `enum`s.


  </TabItem>
  <TabItem value="manually" label="Manually">

    ## Overloading a simple type

    The `JSIConverter<T>` is a template which can be extended with any custom type.

    For example, if you want to use `float` directly you can tell Nitro how to convert a `jsi::Value` to `float` by implementing `JSIConverter<float>`:

    ```cpp title="JSIConverter+Float.hpp"
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
    ```

    Then just use it in your methods:

    ```cpp title="HybridMath.hpp"
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

    ## Complex types (e.g. `struct`)

    The same goes for any complex type, like a custom typed `struct`:

    ```cpp title="JSIConverter+Person.hpp"
    struct Person {
      std::string name;
      double age;
    };

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
    ```

    ..which can now safely be called with any JS value.
    If the given JS value is not an object of exactly the shape of `Person` (that is, a `name: string` and an `age: number` values), Nitro will throw an error.

  </TabItem>
</Tabs>
