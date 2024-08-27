///
/// CallbackHolder.hpp
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



#include <functional>

namespace margelo::nitro::image {

  /**
   * A struct which can be represented as a JavaScript object (CallbackHolder).
   */
  struct CallbackHolder {
  public:
    std::function<void()> callback     SWIFT_PRIVATE;

  public:
    explicit CallbackHolder(std::function<void()> callback): callback(callback) {}
  };

} // namespace margelo::nitro::image

namespace margelo::nitro {

  using namespace margelo::nitro::image;

  // C++ CallbackHolder <> JS CallbackHolder (object)
  template <>
  struct JSIConverter<CallbackHolder> {
    static inline CallbackHolder fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return CallbackHolder(
        JSIConverter<std::function<void()>>::fromJSI(runtime, obj.getProperty(runtime, "callback"))
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const CallbackHolder& arg) {
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "callback", JSIConverter<std::function<void()>>::toJSI(runtime, arg.callback));
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object obj = value.getObject(runtime);
      if (!JSIConverter<std::function<void()>>::canConvert(runtime, obj.getProperty(runtime, "callback"))) return false;
      return true;
    }
  };

} // namespace margelo::nitro
