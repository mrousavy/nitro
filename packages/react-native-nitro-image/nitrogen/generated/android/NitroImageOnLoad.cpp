///
/// NitroImageOnLoad.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#ifndef BUILDING_NITROIMAGE_WITH_GENERATED_CMAKE_PROJECT
#error NitroImageOnLoad.cpp is not being built with the autogenerated CMakeLists.txt project. Is a different CMakeLists.txt building this?
#endif

#include "NitroImageOnLoad.hpp"

#include <jni.h>
#include <fbjni/fbjni.h>
#include <NitroModules/HybridObjectRegistry.hpp>

#include "JHybridImageSpec.hpp"
#include "JFunc_void_std__string.hpp"
#include "JHybridImageFactorySpec.hpp"
#include "JHybridTestObjectSwiftKotlinSpec.hpp"
#include "JFunc_void_double.hpp"
#include "JFunc_void_std__vector_Powertrain_.hpp"
#include "JFunc_void.hpp"
#include "JFunc_void_std__optional_double_.hpp"
#include "JFunc_std__shared_ptr_Promise_double__.hpp"
#include "JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double____.hpp"
#include "JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____.hpp"
#include "JFunc_std__shared_ptr_Promise_std__string__.hpp"
#include "JHybridBaseSpec.hpp"
#include "JHybridChildSpec.hpp"
#include "JHybridTestViewSpec.hpp"
#include "JHybridTestViewStateUpdater.hpp"
#include <NitroModules/JNISharedPtr.hpp>
#include <NitroModules/DefaultConstructableObject.hpp>
#include "HybridTestObjectCpp.hpp"

namespace margelo::nitro::image {

int initialize(JavaVM* vm) {
  using namespace margelo::nitro;
  using namespace margelo::nitro::image;
  using namespace facebook;

  return facebook::jni::initialize(vm, [] {
    // Register native JNI methods
    margelo::nitro::image::JHybridImageSpec::registerNatives();
    margelo::nitro::image::JFunc_void_std__string_cxx::registerNatives();
    margelo::nitro::image::JHybridImageFactorySpec::registerNatives();
    margelo::nitro::image::JHybridTestObjectSwiftKotlinSpec::registerNatives();
    margelo::nitro::image::JFunc_void_double_cxx::registerNatives();
    margelo::nitro::image::JFunc_void_std__vector_Powertrain__cxx::registerNatives();
    margelo::nitro::image::JFunc_void_cxx::registerNatives();
    margelo::nitro::image::JFunc_void_std__optional_double__cxx::registerNatives();
    margelo::nitro::image::JFunc_std__shared_ptr_Promise_double___cxx::registerNatives();
    margelo::nitro::image::JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_double_____cxx::registerNatives();
    margelo::nitro::image::JFunc_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer______cxx::registerNatives();
    margelo::nitro::image::JFunc_std__shared_ptr_Promise_std__string___cxx::registerNatives();
    margelo::nitro::image::JHybridBaseSpec::registerNatives();
    margelo::nitro::image::JHybridChildSpec::registerNatives();
    margelo::nitro::image::JHybridTestViewSpec::registerNatives();
    margelo::nitro::image::views::JHybridTestViewStateUpdater::registerNatives();

    // Register Nitro Hybrid Objects
    HybridObjectRegistry::registerHybridObjectConstructor(
      "ImageFactory",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridImageFactorySpec::javaobject> object("com/margelo/nitro/image/ImageFactory");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridImageFactorySpec>(globalRef);
      }
    );
    HybridObjectRegistry::registerHybridObjectConstructor(
      "TestObjectCpp",
      []() -> std::shared_ptr<HybridObject> {
        static_assert(std::is_default_constructible_v<HybridTestObjectCpp>,
                      "The HybridObject \"HybridTestObjectCpp\" is not default-constructible! "
                      "Create a public constructor that takes zero arguments to be able to autolink this HybridObject.");
        return std::make_shared<HybridTestObjectCpp>();
      }
    );
    HybridObjectRegistry::registerHybridObjectConstructor(
      "TestObjectSwiftKotlin",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridTestObjectSwiftKotlinSpec::javaobject> object("com/margelo/nitro/image/HybridTestObjectKotlin");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridTestObjectSwiftKotlinSpec>(globalRef);
      }
    );
    HybridObjectRegistry::registerHybridObjectConstructor(
      "Base",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridBaseSpec::javaobject> object("com/margelo/nitro/image/HybridBase");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridBaseSpec>(globalRef);
      }
    );
    HybridObjectRegistry::registerHybridObjectConstructor(
      "Child",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridChildSpec::javaobject> object("com/margelo/nitro/image/HybridChild");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridChildSpec>(globalRef);
      }
    );
    HybridObjectRegistry::registerHybridObjectConstructor(
      "TestView",
      []() -> std::shared_ptr<HybridObject> {
        static DefaultConstructableObject<JHybridTestViewSpec::javaobject> object("com/margelo/nitro/image/HybridTestView");
        auto instance = object.create();
        auto globalRef = jni::make_global(instance);
        return JNISharedPtr::make_shared_from_jni<JHybridTestViewSpec>(globalRef);
      }
    );
  });
}

} // namespace margelo::nitro::image
