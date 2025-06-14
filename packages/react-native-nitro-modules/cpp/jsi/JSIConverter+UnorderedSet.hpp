#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include "JSIConverter.hpp"

#include "JSIHelpers.hpp"
#include <jsi/jsi.h>
#include <unordered_set>

namespace margelo::nitro {

using namespace facebook;

template <typename ValueType>
struct JSIConverter<std::unordered_set<ValueType>> final {
  static inline std::unordered_set<ValueType> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
    jsi::Object object = arg.asObject(runtime);
    if (!object.hasProperty(runtime, "values")) {
      throw std::invalid_argument("Value \"" + arg.toString(runtime).utf8(runtime) + "\" is not a Set-like object!");
    }

    jsi::Function valuesFunc = object.getPropertyAsFunction(runtime, "values");
    auto lengthProp = object.getProperty(runtime, "length");
    if (!lengthProp.isNumber()) {
      throw std::invalid_argument("Value \"" + arg.toString(runtime).utf8(runtime) + "\" is not a Set-like object!");
    }
    auto length = (size_t)lengthProp.getNumber();

    auto valuesJsVal_ = valuesFunc.callWithThis(runtime, object);
    auto values = valuesJsVal_.asObject(runtime);

    std::unordered_set<ValueType> set;
    set.reserve(length);

    auto nextFunction = values.getPropertyAsFunction(runtime, "next");
    auto nextResult = nextFunction.callWithThis(runtime, values).asObject(runtime);

    while (!nextResult.getProperty(runtime, "done").asBool()) {
      jsi::Value value = nextResult.getProperty(runtime, "value");
      auto cppValue = JSIConverter<ValueType>::toJSI(runtime, value);
      set.insert(cppValue);
    }

    return set;
  }

  static inline jsi::Value toJSI(jsi::Runtime& runtime, const std::unordered_set<ValueType>& set) {
    auto setObject = runtime.global().getPropertyAsFunction(runtime, "Set").callAsConstructor(runtime).asObject(runtime);
    auto addMethod = setObject.getPropertyAsFunction(runtime, "add");

    for (const auto& value : set) {
      auto jsValue = JSIConverter<ValueType>::toJSI(runtime, value);
      addMethod.callWithThis(runtime, setObject, jsValue, 1);
    }

    return setObject;
  }

  static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
    return value.isObject() && value.asObject(runtime).instanceOf(runtime, runtime.global().getPropertyAsFunction(runtime, "Set"));
  }
};
} // namespace margelo::nitro
