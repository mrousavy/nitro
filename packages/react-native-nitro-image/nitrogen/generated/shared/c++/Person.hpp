///
/// Person.hpp
/// Tue Aug 27 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/JSIConverter.hpp>)
#include <NitroModules/JSIConverter.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
#if __has_include(<NitroModules/NitroDefines.hpp>)
#include <NitroModules/NitroDefines.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif



#include <string>

namespace margelo::nitro::image {

  /**
   * A struct which can be represented as a JavaScript object (Person).
   */
  struct Person {
  public:
    std::string name     SWIFT_PRIVATE;
    double age     SWIFT_PRIVATE;

  public:
    explicit Person(std::string name, double age): name(name), age(age) {}
  };

} // namespace margelo::nitro::image

namespace margelo::nitro {

  using namespace margelo::nitro::image;

  // C++ Person <> JS Person (object)
  template <>
  struct JSIConverter<Person> {
    static inline Person fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return Person(
        JSIConverter<std::string>::fromJSI(runtime, obj.getProperty(runtime, "name")),
        JSIConverter<double>::fromJSI(runtime, obj.getProperty(runtime, "age"))
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const Person& arg) {
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "name", JSIConverter<std::string>::toJSI(runtime, arg.name));
      obj.setProperty(runtime, "age", JSIConverter<double>::toJSI(runtime, arg.age));
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object obj = value.getObject(runtime);
      if (!JSIConverter<std::string>::canConvert(runtime, obj.getProperty(runtime, "name"))) return false;
      if (!JSIConverter<double>::canConvert(runtime, obj.getProperty(runtime, "age"))) return false;
      return true;
    }
  };

} // namespace margelo::nitro
