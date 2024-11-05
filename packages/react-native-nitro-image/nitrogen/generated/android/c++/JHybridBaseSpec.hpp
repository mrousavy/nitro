///
/// HybridBaseSpec.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#include <NitroModules/JHybridObject.hpp>
#include <fbjni/fbjni.h>
#include "HybridBaseSpec.hpp"




namespace margelo::nitro::image {

  using namespace facebook;

  class JHybridBaseSpec: public jni::HybridClass<JHybridBaseSpec, JHybridObject>,
                         public virtual HybridBaseSpec {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/image/HybridBaseSpec;";
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis);
    static void registerNatives();

  protected:
    // C++ constructor (called from Java via `initHybrid()`)
    explicit JHybridBaseSpec(jni::alias_ref<jhybridobject> jThis) :
      HybridObject(HybridBaseSpec::TAG),
      _javaPart(jni::make_global(jThis)) {}

  public:
    virtual ~JHybridBaseSpec() {
      // Hermes GC can destroy JS objects on a non-JNI Thread.
      jni::ThreadScope::WithClassLoader([&] { _javaPart.reset(); });
    }

  public:
    size_t getExternalMemorySize() noexcept override;

  public:
    inline const jni::global_ref<JHybridBaseSpec::javaobject>& getJavaPart() const noexcept {
      return _javaPart;
    }

  public:
    // Properties
    double getBaseValue() override;

  public:
    // Methods
    

  private:
    friend HybridBase;
    using HybridBase::HybridBase;
    jni::global_ref<JHybridBaseSpec::javaobject> _javaPart;
  };

} // namespace margelo::nitro::image
