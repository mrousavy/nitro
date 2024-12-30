//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "NitroTypeInfo.hpp"
#include <exception>
#include <jsi/jsi.h>

namespace margelo::nitro {

using namespace facebook;

// std::exception_ptr <> Error
template <>
struct JSIConverter<std::exception_ptr> final {
  static inline std::exception_ptr fromJSI(jsi::Runtime& runtime, const jsi::Value& error) {
    jsi::Object object = error.asObject(runtime);
    std::string name = object.getProperty(runtime, "name").asString(runtime).utf8(runtime);
    std::string message = object.getProperty(runtime, "message").asString(runtime).utf8(runtime);
    return std::make_exception_ptr(std::runtime_error(name + ": " + message));
  }
  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::exception_ptr& exception) {
    if (exception == nullptr) [[unlikely]] {
      throw std::runtime_error("Cannot convert an empty exception_ptr to a JS Error!");
    }

    try {
      std::rethrow_exception(exception);
    } catch (const std::exception& e) {
      jsi::JSError error(runtime, e.what());
      return jsi::Value(runtime, error.value());
#ifdef ANDROID
      // Workaround for https://github.com/mrousavy/nitro/issues/382
    } catch (const std::runtime_error& e) {
      jsi::JSError error(runtime, e.what());
      return jsi::Value(runtime, error.value());
#endif
    } catch (...) {
      // Some unknown exception was thrown - maybe an Objective-C error?
      std::string errorName = TypeInfo::getCurrentExceptionName();
      jsi::JSError error(runtime, "Unknown " + errorName + " error.");
      return jsi::Value(runtime, error.value());
    }
  }
  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    if (!value.isObject()) {
      return false;
    }
    jsi::Object object = value.getObject(runtime);
    return object.hasProperty(runtime, "name") && object.hasProperty(runtime, "message");
  }
};

} // namespace margelo::nitro
