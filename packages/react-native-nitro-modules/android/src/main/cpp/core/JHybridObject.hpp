//
//  JHybridObject.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include "HybridObject.hpp"
#include "NitroTypeInfo.hpp"
#include <fbjni/fbjni.h>
#include <memory>
#include <stdexcept>
#include <string>

namespace margelo::nitro {

using namespace facebook;

/**
 * Bridges a Java `HybridObject` instance over to C++.
 * - JavaPart: The actual Java Class (HybridObject) - this will be held by `JHybridObject`
 * - CxxPart: The nested Java CxxPart (HybridObject.CxxPart) - this builds the proper inheritance chain and caches C++ state
 */
class JHybridObject : public virtual HybridObject {
public:
  struct JavaPart : jni::JavaClass<JavaPart> {
    static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject;";
    std::shared_ptr<JHybridObject> getJHybridObject();
  };
  struct CxxPart : jni::HybridClass<CxxPart> {
    static constexpr auto kJavaDescriptor = "Lcom/margelo/nitro/core/HybridObject$CxxPart;";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> cxxJavaPart);
    static void registerNatives();
    explicit CxxPart(jni::alias_ref<jhybridobject> cxxJavaPart);
    std::shared_ptr<JHybridObject> getOrCreateHybridObject();

  protected:
    jni::local_ref<JHybridObject::JavaPart> getJavaPart();
    /**
     * Override this method in your Class' CxxPart to allow type-erased inheritance.
     */
    virtual std::shared_ptr<JHybridObject> createHybridObject(const jni::local_ref<JHybridObject::JavaPart>& javaPart);

  private:
    std::weak_ptr<JHybridObject> _hybridObject;
    jni::global_ref<CxxPart::jhybridobject> _cxxJavaPart;
  };

public:
  explicit JHybridObject(const jni::local_ref<JavaPart>& javaPart);
  ~JHybridObject() override;

public:
  template <typename TJavaHybridObject, typename THybridObject>
  static const jni::global_ref<typename TJavaHybridObject::JavaPart>& getJavaPart(const std::shared_ptr<THybridObject>& hybridObject) {
    auto javaHybridObject = std::dynamic_pointer_cast<TJavaHybridObject>(hybridObject);
    if (javaHybridObject == nullptr) [[unlikely]] {
      std::string actualType = hybridObject != nullptr ? hybridObject->getName() : "nullptr";
      std::string expectedType = TypeInfo::getFriendlyTypename<TJavaHybridObject>(true);
      throw std::runtime_error("Cannot pass HybridObject \"" + actualType + "\" to Kotlin as \"" + expectedType +
                               "\" - it is not implemented in Kotlin!");
    }
    return javaHybridObject->getJavaPart();
  }

public:
  void dispose() noexcept override;
  bool equals(const std::shared_ptr<HybridObject>& other) override;
  size_t getExternalMemorySize() noexcept override;
  std::string toString() override;

private:
  jni::global_ref<JavaPart> _javaPart;
};

} // namespace margelo::nitro
