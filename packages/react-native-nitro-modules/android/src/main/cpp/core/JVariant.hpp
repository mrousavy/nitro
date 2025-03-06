//
//  JVariant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>
#include <variant>

namespace margelo::nitro {

using namespace facebook;

/**
 * A JNI HybridClass that holds variants of 2 generic values (objects).
 */
class JVariant2 final : public jni::HybridClass<JVariant2> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Variant2;";
  using VariantType = std::variant<jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>>;

public:
  static jni::local_ref<JVariant2::javaobject> fromCpp(const VariantType& variant) {
    return JVariant2::newObjectCxxArgs(variant);
  }

public:
  bool isFirst() {
    return _variant.index() == 0;
  }
  bool isSecond() {
    return _variant.index() == 1;
  }
  jni::global_ref<jni::JObject> getFirst() {
    return std::get<0>(_variant);
  }
  jni::global_ref<jni::JObject> getSecond() {
    return std::get<1>(_variant);
  }

public:
  static void registerNatives() {
    registerHybrid({
        makeNativeMethod("isFirst", JVariant2::isFirst),
        makeNativeMethod("isSecond", JVariant2::isSecond),
        makeNativeMethod("getFirst", JVariant2::getFirst),
        makeNativeMethod("getSecond", JVariant2::getSecond),
    });
  }

private:
  friend HybridBase;
  explicit JVariant2(const VariantType& variant) : _variant(variant) {}

private:
  VariantType _variant;
};

/**
 * A JNI HybridClass that holds variants of 3 generic values (objects).
 */
class JVariant3 final : public jni::HybridClass<JVariant3> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Variant3;";
  using VariantType = std::variant<jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>>;

public:
  static jni::local_ref<JVariant3::javaobject> fromCpp(const VariantType& variant) {
    return JVariant3::newObjectCxxArgs(variant);
  }

public:
  bool isFirst() {
    return _variant.index() == 0;
  }
  bool isSecond() {
    return _variant.index() == 1;
  }
  bool isThird() {
    return _variant.index() == 2;
  }
  jni::global_ref<jni::JObject> getFirst() {
    return std::get<0>(_variant);
  }
  jni::global_ref<jni::JObject> getSecond() {
    return std::get<1>(_variant);
  }
  jni::global_ref<jni::JObject> getThird() {
    return std::get<2>(_variant);
  }

public:
  static void registerNatives() {
    registerHybrid({makeNativeMethod("isFirst", JVariant3::isFirst), makeNativeMethod("isSecond", JVariant3::isSecond),
                    makeNativeMethod("isThird", JVariant3::isThird), makeNativeMethod("getFirst", JVariant3::getFirst),
                    makeNativeMethod("getSecond", JVariant3::getSecond), makeNativeMethod("getThird", JVariant3::getThird)});
  }

private:
  friend HybridBase;
  explicit JVariant3(const VariantType& variant) : _variant(variant) {}

private:
  VariantType _variant;
};

/**
 * A JNI HybridClass that holds variants of 4 generic values (objects).
 */
class JVariant4 final : public jni::HybridClass<JVariant4> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Variant4;";
  using VariantType = std::variant<jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>,
                                   jni::global_ref<jni::JObject>>;

public:
  static jni::local_ref<JVariant4::javaobject> fromCpp(const VariantType& variant) {
    return JVariant4::newObjectCxxArgs(variant);
  }

public:
  bool isFirst() {
    return _variant.index() == 0;
  }
  bool isSecond() {
    return _variant.index() == 1;
  }
  bool isThird() {
    return _variant.index() == 2;
  }
  bool isFourth() {
    return _variant.index() == 3;
  }
  jni::global_ref<jni::JObject> getFirst() {
    return std::get<0>(_variant);
  }
  jni::global_ref<jni::JObject> getSecond() {
    return std::get<1>(_variant);
  }
  jni::global_ref<jni::JObject> getThird() {
    return std::get<2>(_variant);
  }
  jni::global_ref<jni::JObject> getFourth() {
    return std::get<3>(_variant);
  }

public:
  static void registerNatives() {
    registerHybrid({makeNativeMethod("isFirst", JVariant4::isFirst), makeNativeMethod("isSecond", JVariant4::isSecond),
                    makeNativeMethod("isThird", JVariant4::isThird), makeNativeMethod("isFourth", JVariant4::isFourth),
                    makeNativeMethod("getFirst", JVariant4::getFirst), makeNativeMethod("getSecond", JVariant4::getSecond),
                    makeNativeMethod("getThird", JVariant4::getThird), makeNativeMethod("getFourth", JVariant4::getFourth)});
  }

private:
  friend HybridBase;
  explicit JVariant4(const VariantType& variant) : _variant(variant) {}

private:
  VariantType _variant;
};

/**
 * A JNI HybridClass that holds variants of 5 generic values (objects).
 */
class JVariant5 final : public jni::HybridClass<JVariant5> {
public:
  static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/Variant5;";
  using VariantType = std::variant<jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>,
                                   jni::global_ref<jni::JObject>, jni::global_ref<jni::JObject>>;

public:
  static jni::local_ref<JVariant5::javaobject> fromCpp(const VariantType& variant) {
    return JVariant5::newObjectCxxArgs(variant);
  }

public:
  bool isFirst() {
    return _variant.index() == 0;
  }
  bool isSecond() {
    return _variant.index() == 1;
  }
  bool isThird() {
    return _variant.index() == 2;
  }
  bool isFourth() {
    return _variant.index() == 3;
  }
  bool isFifth() {
    return _variant.index() == 4;
  }
  jni::global_ref<jni::JObject> getFirst() {
    return std::get<0>(_variant);
  }
  jni::global_ref<jni::JObject> getSecond() {
    return std::get<1>(_variant);
  }
  jni::global_ref<jni::JObject> getThird() {
    return std::get<2>(_variant);
  }
  jni::global_ref<jni::JObject> getFourth() {
    return std::get<3>(_variant);
  }
  jni::global_ref<jni::JObject> getFifth() {
    return std::get<4>(_variant);
  }

public:
  static void registerNatives() {
    registerHybrid({makeNativeMethod("isFirst", JVariant5::isFirst), makeNativeMethod("isSecond", JVariant5::isSecond),
                    makeNativeMethod("isThird", JVariant5::isThird), makeNativeMethod("isFourth", JVariant5::isFourth),
                    makeNativeMethod("isFifth", JVariant5::isFifth), makeNativeMethod("getFirst", JVariant5::getFirst),
                    makeNativeMethod("getSecond", JVariant5::getSecond), makeNativeMethod("getThird", JVariant5::getThird),
                    makeNativeMethod("getFourth", JVariant5::getFourth), makeNativeMethod("getFifth", JVariant5::getFifth)});
  }

private:
  friend HybridBase;
  explicit JVariant5(const VariantType& variant) : _variant(variant) {}

private:
  VariantType _variant;
};

} // namespace margelo::nitro
