//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

/**
 * Represents the Java `HybridObject` class.
 */
class JHybridObject : public virtual HybridObject {
public:
  // Java part for JHybridObject
  struct JavaPart: public jni::JavaClass<JHybridObject::JavaPart> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";
  };
  // C++ part for JHybridObject
  struct CppPart: public jni::HybridClass<JHybridObject::CppPart> {
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject$CppPart;";
    static jni::local_ref<CppPart::jhybriddata> initHybrid(jni::alias_ref<CppPart::javaobject> jThis) {
      return makeCxxInstance(jThis);
    }
    explicit CppPart(jni::alias_ref<CppPart::javaobject> jThis): _jThis(jni::make_global(jThis)) { }

    virtual std::shared_ptr<JHybridObject> getCppPart() {
      if (auto cppPart = _cppPart.lock()) {
        return cppPart;
      }
      auto javaPart = getJavaPart();
      return std::make_shared<JHybridObject>(javaPart);
    }
    virtual jni::local_ref<JHybridObject::JavaPart> getJavaPart() {
      static auto field = javaClassStatic()->getField<JHybridObject::JavaPart>("javaPart");
      return _jThis->getFieldValue(field);
    }

   private:
    jni::global_ref<CppPart::javaobject> _jThis;
    std::weak_ptr<JHybridObject> _cppPart;
  };

public:
  explicit JHybridObject(const jni::local_ref<JavaPart>& javaPart):
    _javaPart(jni::make_global(javaPart)) {}

  size_t getExternalMemorySize() noexcept override;
  bool equals(const std::shared_ptr<HybridObject>& other) override;
  void dispose() noexcept override;
  std::string toString() override;

private:
  jni::global_ref<JavaPart> _javaPart;
};

} // namespace margelo::nitro
