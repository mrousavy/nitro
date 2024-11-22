///
/// JHybridTestObjectSwiftKotlinSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#include "JHybridTestObjectSwiftKotlinSpec.hpp"

// Forward declaration of `HybridTestObjectSwiftKotlinSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectSwiftKotlinSpec; }
// Forward declaration of `Powertrain` to properly resolve imports.
namespace margelo::nitro::image { enum class Powertrain; }
// Forward declaration of `OldEnum` to properly resolve imports.
namespace margelo::nitro::image { enum class OldEnum; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }
// Forward declaration of `AnyMap` to properly resolve imports.
namespace NitroModules { class AnyMap; }
// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `ArrayBuffer` to properly resolve imports.
namespace NitroModules { class ArrayBuffer; }
// Forward declaration of `HybridChildSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridChildSpec; }
// Forward declaration of `HybridBaseSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpec; }

#include <memory>
#include "HybridTestObjectSwiftKotlinSpec.hpp"
#include "JHybridTestObjectSwiftKotlinSpec.hpp"
#include <NitroModules/JNISharedPtr.hpp>
#include <optional>
#include <string>
#include <vector>
#include "Powertrain.hpp"
#include "JPowertrain.hpp"
#include "OldEnum.hpp"
#include "JOldEnum.hpp"
#include <variant>
#include "JVariant_String_Double.hpp"
#include "Person.hpp"
#include "JPerson.hpp"
#include <NitroModules/AnyMap.hpp>
#include <NitroModules/JAnyMap.hpp>
#include <NitroModules/Promise.hpp>
#include <NitroModules/JPromise.hpp>
#include "Car.hpp"
#include "JCar.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/JArrayBuffer.hpp>
#include <NitroModules/JUnit.hpp>
#include "HybridChildSpec.hpp"
#include "JHybridChildSpec.hpp"
#include "HybridBaseSpec.hpp"
#include "JHybridBaseSpec.hpp"
#include <NitroModules/Callback.hpp>
#include "JCallback_void_std__vector_Powertrain_.hpp"
#include "JCallback_void.hpp"
#include "JCallback_void_std__optional_double_.hpp"

namespace margelo::nitro::image {

  jni::local_ref<JHybridTestObjectSwiftKotlinSpec::jhybriddata> JHybridTestObjectSwiftKotlinSpec::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void JHybridTestObjectSwiftKotlinSpec::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", JHybridTestObjectSwiftKotlinSpec::initHybrid),
    });
  }

  size_t JHybridTestObjectSwiftKotlinSpec::getExternalMemorySize() noexcept {
    static const auto method = _javaPart->getClass()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart);
  }

  // Properties
  std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> JHybridTestObjectSwiftKotlinSpec::getThisObject() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>()>("getThisObject");
    auto __result = method(_javaPart);
    return JNISharedPtr::make_shared_from_jni<JHybridTestObjectSwiftKotlinSpec>(jni::make_global(__result));
  }
  std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>> JHybridTestObjectSwiftKotlinSpec::getOptionalHybrid() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>()>("getOptionalHybrid");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(JNISharedPtr::make_shared_from_jni<JHybridTestObjectSwiftKotlinSpec>(jni::make_global(__result))) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setOptionalHybrid(const std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>& optionalHybrid) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JHybridTestObjectSwiftKotlinSpec::javaobject> /* optionalHybrid */)>("setOptionalHybrid");
    method(_javaPart, optionalHybrid.has_value() ? std::dynamic_pointer_cast<JHybridTestObjectSwiftKotlinSpec>(optionalHybrid.value())->getJavaPart() : nullptr);
  }
  double JHybridTestObjectSwiftKotlinSpec::getNumberValue() {
    static const auto method = _javaPart->getClass()->getMethod<double()>("getNumberValue");
    auto __result = method(_javaPart);
    return __result;
  }
  void JHybridTestObjectSwiftKotlinSpec::setNumberValue(double numberValue) {
    static const auto method = _javaPart->getClass()->getMethod<void(double /* numberValue */)>("setNumberValue");
    method(_javaPart, numberValue);
  }
  bool JHybridTestObjectSwiftKotlinSpec::getBoolValue() {
    static const auto method = _javaPart->getClass()->getMethod<jboolean()>("getBoolValue");
    auto __result = method(_javaPart);
    return static_cast<bool>(__result);
  }
  void JHybridTestObjectSwiftKotlinSpec::setBoolValue(bool boolValue) {
    static const auto method = _javaPart->getClass()->getMethod<void(jboolean /* boolValue */)>("setBoolValue");
    method(_javaPart, boolValue);
  }
  std::string JHybridTestObjectSwiftKotlinSpec::getStringValue() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>()>("getStringValue");
    auto __result = method(_javaPart);
    return __result->toStdString();
  }
  void JHybridTestObjectSwiftKotlinSpec::setStringValue(const std::string& stringValue) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JString> /* stringValue */)>("setStringValue");
    method(_javaPart, jni::make_jstring(stringValue));
  }
  int64_t JHybridTestObjectSwiftKotlinSpec::getBigintValue() {
    static const auto method = _javaPart->getClass()->getMethod<int64_t()>("getBigintValue");
    auto __result = method(_javaPart);
    return __result;
  }
  void JHybridTestObjectSwiftKotlinSpec::setBigintValue(int64_t bigintValue) {
    static const auto method = _javaPart->getClass()->getMethod<void(int64_t /* bigintValue */)>("setBigintValue");
    method(_javaPart, bigintValue);
  }
  std::optional<std::string> JHybridTestObjectSwiftKotlinSpec::getStringOrUndefined() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>()>("getStringOrUndefined");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(__result->toStdString()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setStringOrUndefined(const std::optional<std::string>& stringOrUndefined) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JString> /* stringOrUndefined */)>("setStringOrUndefined");
    method(_javaPart, stringOrUndefined.has_value() ? jni::make_jstring(stringOrUndefined.value()) : nullptr);
  }
  std::optional<std::string> JHybridTestObjectSwiftKotlinSpec::getStringOrNull() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>()>("getStringOrNull");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(__result->toStdString()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setStringOrNull(const std::optional<std::string>& stringOrNull) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JString> /* stringOrNull */)>("setStringOrNull");
    method(_javaPart, stringOrNull.has_value() ? jni::make_jstring(stringOrNull.value()) : nullptr);
  }
  std::optional<std::string> JHybridTestObjectSwiftKotlinSpec::getOptionalString() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>()>("getOptionalString");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(__result->toStdString()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setOptionalString(const std::optional<std::string>& optionalString) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JString> /* optionalString */)>("setOptionalString");
    method(_javaPart, optionalString.has_value() ? jni::make_jstring(optionalString.value()) : nullptr);
  }
  std::optional<std::vector<std::string>> JHybridTestObjectSwiftKotlinSpec::getOptionalArray() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JArrayClass<jni::JString>>()>("getOptionalArray");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional([&]() {
      size_t __size = __result->size();
      std::vector<std::string> __vector;
      __vector.reserve(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        auto __element = __result->getElement(__i);
        __vector.push_back(__element->toStdString());
      }
      return __vector;
    }()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setOptionalArray(const std::optional<std::vector<std::string>>& optionalArray) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JArrayClass<jni::JString>> /* optionalArray */)>("setOptionalArray");
    method(_javaPart, optionalArray.has_value() ? [&]() {
      size_t __size = optionalArray.value().size();
      jni::local_ref<jni::JArrayClass<jni::JString>> __array = jni::JArrayClass<jni::JString>::newArray(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        const auto& __element = optionalArray.value()[__i];
        __array->setElement(__i, *jni::make_jstring(__element));
      }
      return __array;
    }() : nullptr);
  }
  std::optional<Powertrain> JHybridTestObjectSwiftKotlinSpec::getOptionalEnum() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPowertrain>()>("getOptionalEnum");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(__result->toCpp()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setOptionalEnum(std::optional<Powertrain> optionalEnum) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JPowertrain> /* optionalEnum */)>("setOptionalEnum");
    method(_javaPart, optionalEnum.has_value() ? JPowertrain::fromCpp(optionalEnum.value()) : nullptr);
  }
  std::optional<OldEnum> JHybridTestObjectSwiftKotlinSpec::getOptionalOldEnum() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JOldEnum>()>("getOptionalOldEnum");
    auto __result = method(_javaPart);
    return __result != nullptr ? std::make_optional(__result->toCpp()) : std::nullopt;
  }
  void JHybridTestObjectSwiftKotlinSpec::setOptionalOldEnum(std::optional<OldEnum> optionalOldEnum) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JOldEnum> /* optionalOldEnum */)>("setOptionalOldEnum");
    method(_javaPart, optionalOldEnum.has_value() ? JOldEnum::fromCpp(optionalOldEnum.value()) : nullptr);
  }
  std::variant<std::string, double> JHybridTestObjectSwiftKotlinSpec::getSomeVariant() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JVariant_String_Double>()>("getSomeVariant");
    auto __result = method(_javaPart);
    return __result->toCpp();
  }
  void JHybridTestObjectSwiftKotlinSpec::setSomeVariant(const std::variant<std::string, double>& someVariant) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JVariant_String_Double> /* someVariant */)>("setSomeVariant");
    method(_javaPart, JVariant_String_Double::fromCpp(someVariant));
  }

  // Methods
  std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> JHybridTestObjectSwiftKotlinSpec::newTestObject() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridTestObjectSwiftKotlinSpec::javaobject>()>("newTestObject");
    auto __result = method(_javaPart);
    return JNISharedPtr::make_shared_from_jni<JHybridTestObjectSwiftKotlinSpec>(jni::make_global(__result));
  }
  void JHybridTestObjectSwiftKotlinSpec::simpleFunc() {
    static const auto method = _javaPart->getClass()->getMethod<void()>("simpleFunc");
    method(_javaPart);
  }
  double JHybridTestObjectSwiftKotlinSpec::addNumbers(double a, double b) {
    static const auto method = _javaPart->getClass()->getMethod<double(double /* a */, double /* b */)>("addNumbers");
    auto __result = method(_javaPart, a, b);
    return __result;
  }
  std::string JHybridTestObjectSwiftKotlinSpec::addStrings(const std::string& a, const std::string& b) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>(jni::alias_ref<jni::JString> /* a */, jni::alias_ref<jni::JString> /* b */)>("addStrings");
    auto __result = method(_javaPart, jni::make_jstring(a), jni::make_jstring(b));
    return __result->toStdString();
  }
  void JHybridTestObjectSwiftKotlinSpec::multipleArguments(double num, const std::string& str, bool boo) {
    static const auto method = _javaPart->getClass()->getMethod<void(double /* num */, jni::alias_ref<jni::JString> /* str */, jboolean /* boo */)>("multipleArguments");
    method(_javaPart, num, jni::make_jstring(str), boo);
  }
  std::vector<std::string> JHybridTestObjectSwiftKotlinSpec::bounceStrings(const std::vector<std::string>& array) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JArrayClass<jni::JString>>(jni::alias_ref<jni::JArrayClass<jni::JString>> /* array */)>("bounceStrings");
    auto __result = method(_javaPart, [&]() {
      size_t __size = array.size();
      jni::local_ref<jni::JArrayClass<jni::JString>> __array = jni::JArrayClass<jni::JString>::newArray(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        const auto& __element = array[__i];
        __array->setElement(__i, *jni::make_jstring(__element));
      }
      return __array;
    }());
    return [&]() {
      size_t __size = __result->size();
      std::vector<std::string> __vector;
      __vector.reserve(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        auto __element = __result->getElement(__i);
        __vector.push_back(__element->toStdString());
      }
      return __vector;
    }();
  }
  std::vector<double> JHybridTestObjectSwiftKotlinSpec::bounceNumbers(const std::vector<double>& array) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JArrayDouble>(jni::alias_ref<jni::JArrayDouble> /* array */)>("bounceNumbers");
    auto __result = method(_javaPart, [&]() {
      size_t __size = array.size();
      jni::local_ref<jni::JArrayDouble> __array = jni::JArrayDouble::newArray(__size);
      __array->setRegion(0, __size, array.data());
      return __array;
    }());
    return [&]() {
      size_t __size = __result->size();
      std::vector<double> __vector(__size);
      __result->getRegion(0, __size, __vector.data());
      return __vector;
    }();
  }
  std::vector<Person> JHybridTestObjectSwiftKotlinSpec::bounceStructs(const std::vector<Person>& array) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JArrayClass<JPerson>>(jni::alias_ref<jni::JArrayClass<JPerson>> /* array */)>("bounceStructs");
    auto __result = method(_javaPart, [&]() {
      size_t __size = array.size();
      jni::local_ref<jni::JArrayClass<JPerson>> __array = jni::JArrayClass<JPerson>::newArray(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        const auto& __element = array[__i];
        __array->setElement(__i, *JPerson::fromCpp(__element));
      }
      return __array;
    }());
    return [&]() {
      size_t __size = __result->size();
      std::vector<Person> __vector;
      __vector.reserve(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        auto __element = __result->getElement(__i);
        __vector.push_back(__element->toCpp());
      }
      return __vector;
    }();
  }
  std::vector<Powertrain> JHybridTestObjectSwiftKotlinSpec::bounceEnums(const std::vector<Powertrain>& array) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JArrayClass<JPowertrain>>(jni::alias_ref<jni::JArrayClass<JPowertrain>> /* array */)>("bounceEnums");
    auto __result = method(_javaPart, [&]() {
      size_t __size = array.size();
      jni::local_ref<jni::JArrayClass<JPowertrain>> __array = jni::JArrayClass<JPowertrain>::newArray(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        const auto& __element = array[__i];
        __array->setElement(__i, *JPowertrain::fromCpp(__element));
      }
      return __array;
    }());
    return [&]() {
      size_t __size = __result->size();
      std::vector<Powertrain> __vector;
      __vector.reserve(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        auto __element = __result->getElement(__i);
        __vector.push_back(__element->toCpp());
      }
      return __vector;
    }();
  }
  void JHybridTestObjectSwiftKotlinSpec::complexEnumCallback(const std::vector<Powertrain>& array, const Callback<void(const std::vector<Powertrain>& /* array */)>& callback) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JArrayClass<JPowertrain>> /* array */, jni::alias_ref<JCallback_void_std__vector_Powertrain_::javaobject> /* callback */)>("complexEnumCallback");
    method(_javaPart, [&]() {
      size_t __size = array.size();
      jni::local_ref<jni::JArrayClass<JPowertrain>> __array = jni::JArrayClass<JPowertrain>::newArray(__size);
      for (size_t __i = 0; __i < __size; __i++) {
        const auto& __element = array[__i];
        __array->setElement(__i, *JPowertrain::fromCpp(__element));
      }
      return __array;
    }(), JCallback_void_std__vector_Powertrain_::fromCpp(callback));
  }
  std::shared_ptr<AnyMap> JHybridTestObjectSwiftKotlinSpec::createMap() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JAnyMap::javaobject>()>("createMap");
    auto __result = method(_javaPart);
    return __result->cthis()->getMap();
  }
  std::shared_ptr<AnyMap> JHybridTestObjectSwiftKotlinSpec::mapRoundtrip(const std::shared_ptr<AnyMap>& map) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JAnyMap::javaobject>(jni::alias_ref<JAnyMap::javaobject> /* map */)>("mapRoundtrip");
    auto __result = method(_javaPart, JAnyMap::create(map));
    return __result->cthis()->getMap();
  }
  double JHybridTestObjectSwiftKotlinSpec::funcThatThrows() {
    static const auto method = _javaPart->getClass()->getMethod<double()>("funcThatThrows");
    auto __result = method(_javaPart);
    return __result;
  }
  std::string JHybridTestObjectSwiftKotlinSpec::tryOptionalParams(double num, bool boo, const std::optional<std::string>& str) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>(double /* num */, jboolean /* boo */, jni::alias_ref<jni::JString> /* str */)>("tryOptionalParams");
    auto __result = method(_javaPart, num, boo, str.has_value() ? jni::make_jstring(str.value()) : nullptr);
    return __result->toStdString();
  }
  std::string JHybridTestObjectSwiftKotlinSpec::tryMiddleParam(double num, std::optional<bool> boo, const std::string& str) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<jni::JString>(double /* num */, jni::alias_ref<jni::JBoolean> /* boo */, jni::alias_ref<jni::JString> /* str */)>("tryMiddleParam");
    auto __result = method(_javaPart, num, boo.has_value() ? jni::JBoolean::valueOf(boo.value()) : nullptr, jni::make_jstring(str));
    return __result->toStdString();
  }
  std::optional<Powertrain> JHybridTestObjectSwiftKotlinSpec::tryOptionalEnum(std::optional<Powertrain> value) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPowertrain>(jni::alias_ref<JPowertrain> /* value */)>("tryOptionalEnum");
    auto __result = method(_javaPart, value.has_value() ? JPowertrain::fromCpp(value.value()) : nullptr);
    return __result != nullptr ? std::make_optional(__result->toCpp()) : std::nullopt;
  }
  int64_t JHybridTestObjectSwiftKotlinSpec::calculateFibonacciSync(double value) {
    static const auto method = _javaPart->getClass()->getMethod<int64_t(double /* value */)>("calculateFibonacciSync");
    auto __result = method(_javaPart, value);
    return __result;
  }
  std::shared_ptr<Promise<int64_t>> JHybridTestObjectSwiftKotlinSpec::calculateFibonacciAsync(double value) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>(double /* value */)>("calculateFibonacciAsync");
    auto __result = method(_javaPart, value);
    return [&]() {
      auto __promise = Promise<int64_t>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JLong>(__boxedResult);
        __promise->resolve(__result->value());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridTestObjectSwiftKotlinSpec::wait(double seconds) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>(double /* seconds */)>("wait");
    auto __result = method(_javaPart, seconds);
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridTestObjectSwiftKotlinSpec::promiseThrows() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>()>("promiseThrows");
    auto __result = method(_javaPart);
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<double>> JHybridTestObjectSwiftKotlinSpec::awaitAndGetPromise(const std::shared_ptr<Promise<double>>& promise) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JPromise::javaobject> /* promise */)>("awaitAndGetPromise");
    auto __result = method(_javaPart, [&]() {
      jni::local_ref<JPromise::javaobject> __promise = JPromise::create();
      promise->addOnResolvedListener([=](const double& __result) {
        __promise->cthis()->resolve(jni::JDouble::valueOf(__result));
      });
      promise->addOnRejectedListener([=](const std::exception_ptr& __error) {
        auto __jniError = jni::getJavaExceptionForCppException(__error);
        __promise->cthis()->reject(__jniError);
      });
      return __promise;
    }());
    return [&]() {
      auto __promise = Promise<double>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JDouble>(__boxedResult);
        __promise->resolve(__result->value());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<Car>> JHybridTestObjectSwiftKotlinSpec::awaitAndGetComplexPromise(const std::shared_ptr<Promise<Car>>& promise) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JPromise::javaobject> /* promise */)>("awaitAndGetComplexPromise");
    auto __result = method(_javaPart, [&]() {
      jni::local_ref<JPromise::javaobject> __promise = JPromise::create();
      promise->addOnResolvedListener([=](const Car& __result) {
        __promise->cthis()->resolve(JCar::fromCpp(__result));
      });
      promise->addOnRejectedListener([=](const std::exception_ptr& __error) {
        auto __jniError = jni::getJavaExceptionForCppException(__error);
        __promise->cthis()->reject(__jniError);
      });
      return __promise;
    }());
    return [&]() {
      auto __promise = Promise<Car>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JCar>(__boxedResult);
        __promise->resolve(__result->toCpp());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<void>> JHybridTestObjectSwiftKotlinSpec::awaitPromise(const std::shared_ptr<Promise<void>>& promise) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JPromise::javaobject> /* promise */)>("awaitPromise");
    auto __result = method(_javaPart, [&]() {
      jni::local_ref<JPromise::javaobject> __promise = JPromise::create();
      promise->addOnResolvedListener([=]() {
        __promise->cthis()->resolve(JUnit::instance());
      });
      promise->addOnRejectedListener([=](const std::exception_ptr& __error) {
        auto __jniError = jni::getJavaExceptionForCppException(__error);
        __promise->cthis()->reject(__jniError);
      });
      return __promise;
    }());
    return [&]() {
      auto __promise = Promise<void>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        __promise->resolve();
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  void JHybridTestObjectSwiftKotlinSpec::callCallback(const Callback<void()>& callback) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JCallback_void::javaobject> /* callback */)>("callCallback");
    method(_javaPart, JCallback_void::fromCpp(callback));
  }
  void JHybridTestObjectSwiftKotlinSpec::callAll(const Callback<void()>& first, const Callback<void()>& second, const Callback<void()>& third) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JCallback_void::javaobject> /* first */, jni::alias_ref<JCallback_void::javaobject> /* second */, jni::alias_ref<JCallback_void::javaobject> /* third */)>("callAll");
    method(_javaPart, JCallback_void::fromCpp(first), JCallback_void::fromCpp(second), JCallback_void::fromCpp(third));
  }
  void JHybridTestObjectSwiftKotlinSpec::callWithOptional(std::optional<double> value, const Callback<void(std::optional<double> /* maybe */)>& callback) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<jni::JDouble> /* value */, jni::alias_ref<JCallback_void_std__optional_double_::javaobject> /* callback */)>("callWithOptional");
    method(_javaPart, value.has_value() ? jni::JDouble::valueOf(value.value()) : nullptr, JCallback_void_std__optional_double_::fromCpp(callback));
  }
  Car JHybridTestObjectSwiftKotlinSpec::getCar() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JCar>()>("getCar");
    auto __result = method(_javaPart);
    return __result->toCpp();
  }
  bool JHybridTestObjectSwiftKotlinSpec::isCarElectric(const Car& car) {
    static const auto method = _javaPart->getClass()->getMethod<jboolean(jni::alias_ref<JCar> /* car */)>("isCarElectric");
    auto __result = method(_javaPart, JCar::fromCpp(car));
    return static_cast<bool>(__result);
  }
  std::optional<Person> JHybridTestObjectSwiftKotlinSpec::getDriver(const Car& car) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPerson>(jni::alias_ref<JCar> /* car */)>("getDriver");
    auto __result = method(_javaPart, JCar::fromCpp(car));
    return __result != nullptr ? std::make_optional(__result->toCpp()) : std::nullopt;
  }
  std::shared_ptr<ArrayBuffer> JHybridTestObjectSwiftKotlinSpec::createArrayBuffer() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JArrayBuffer::javaobject>()>("createArrayBuffer");
    auto __result = method(_javaPart);
    return __result->cthis()->getArrayBuffer();
  }
  double JHybridTestObjectSwiftKotlinSpec::getBufferLastItem(const std::shared_ptr<ArrayBuffer>& buffer) {
    static const auto method = _javaPart->getClass()->getMethod<double(jni::alias_ref<JArrayBuffer::javaobject> /* buffer */)>("getBufferLastItem");
    auto __result = method(_javaPart, JArrayBuffer::wrap(buffer));
    return __result;
  }
  void JHybridTestObjectSwiftKotlinSpec::setAllValuesTo(const std::shared_ptr<ArrayBuffer>& buffer, double value) {
    static const auto method = _javaPart->getClass()->getMethod<void(jni::alias_ref<JArrayBuffer::javaobject> /* buffer */, double /* value */)>("setAllValuesTo");
    method(_javaPart, JArrayBuffer::wrap(buffer), value);
  }
  std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> JHybridTestObjectSwiftKotlinSpec::createArrayBufferAsync() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JPromise::javaobject>()>("createArrayBufferAsync");
    auto __result = method(_javaPart);
    return [&]() {
      auto __promise = Promise<std::shared_ptr<ArrayBuffer>>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JArrayBuffer::javaobject>(__boxedResult);
        __promise->resolve(__result->cthis()->getArrayBuffer());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::move(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<margelo::nitro::image::HybridChildSpec> JHybridTestObjectSwiftKotlinSpec::createChild() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridChildSpec::javaobject>()>("createChild");
    auto __result = method(_javaPart);
    return JNISharedPtr::make_shared_from_jni<JHybridChildSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> JHybridTestObjectSwiftKotlinSpec::createBase() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridBaseSpec::javaobject>()>("createBase");
    auto __result = method(_javaPart);
    return JNISharedPtr::make_shared_from_jni<JHybridBaseSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> JHybridTestObjectSwiftKotlinSpec::createBaseActualChild() {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridBaseSpec::javaobject>()>("createBaseActualChild");
    auto __result = method(_javaPart);
    return JNISharedPtr::make_shared_from_jni<JHybridBaseSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridChildSpec> JHybridTestObjectSwiftKotlinSpec::bounceChild(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridChildSpec::javaobject>(jni::alias_ref<JHybridChildSpec::javaobject> /* child */)>("bounceChild");
    auto __result = method(_javaPart, std::dynamic_pointer_cast<JHybridChildSpec>(child)->getJavaPart());
    return JNISharedPtr::make_shared_from_jni<JHybridChildSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> JHybridTestObjectSwiftKotlinSpec::bounceBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridBaseSpec::javaobject>(jni::alias_ref<JHybridBaseSpec::javaobject> /* base */)>("bounceBase");
    auto __result = method(_javaPart, std::dynamic_pointer_cast<JHybridBaseSpec>(base)->getJavaPart());
    return JNISharedPtr::make_shared_from_jni<JHybridBaseSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> JHybridTestObjectSwiftKotlinSpec::bounceChildBase(const std::shared_ptr<margelo::nitro::image::HybridChildSpec>& child) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridBaseSpec::javaobject>(jni::alias_ref<JHybridChildSpec::javaobject> /* child */)>("bounceChildBase");
    auto __result = method(_javaPart, std::dynamic_pointer_cast<JHybridChildSpec>(child)->getJavaPart());
    return JNISharedPtr::make_shared_from_jni<JHybridBaseSpec>(jni::make_global(__result));
  }
  std::shared_ptr<margelo::nitro::image::HybridChildSpec> JHybridTestObjectSwiftKotlinSpec::castBase(const std::shared_ptr<margelo::nitro::image::HybridBaseSpec>& base) {
    static const auto method = _javaPart->getClass()->getMethod<jni::local_ref<JHybridChildSpec::javaobject>(jni::alias_ref<JHybridBaseSpec::javaobject> /* base */)>("castBase");
    auto __result = method(_javaPart, std::dynamic_pointer_cast<JHybridBaseSpec>(base)->getJavaPart());
    return JNISharedPtr::make_shared_from_jni<JHybridChildSpec>(jni::make_global(__result));
  }

} // namespace margelo::nitro::image
