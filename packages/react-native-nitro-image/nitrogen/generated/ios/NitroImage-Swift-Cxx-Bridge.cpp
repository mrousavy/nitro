///
/// NitroImage-Swift-Cxx-Bridge.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "NitroImage-Swift-Cxx-Bridge.hpp"

// Include C++ implementation defined types
#include "HybridBaseSpecSwift.hpp"
#include "HybridChildSpecSwift.hpp"
#include "HybridImageFactorySpecSwift.hpp"
#include "HybridImageSpecSwift.hpp"
#include "HybridTestObjectSwiftKotlinSpecSwift.hpp"
#include "NitroImage-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::image::bridge::swift {

  // pragma MARK: std::function<void(const std::string& /* path */)>
  Func_void_std__string create_Func_void_std__string(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__string::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::string& path) mutable -> void {
      swiftClosure.call(path);
    };
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridImageSpec>
  std::shared_ptr<margelo::nitro::image::HybridImageSpec> create_std__shared_ptr_margelo__nitro__image__HybridImageSpec_(void* _Nonnull swiftUnsafePointer) {
    NitroImage::HybridImageSpec_cxx swiftPart = NitroImage::HybridImageSpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::image::HybridImageSpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridImageSpec_(std__shared_ptr_margelo__nitro__image__HybridImageSpec_ cppType) {
    std::shared_ptr<margelo::nitro::image::HybridImageSpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::image::HybridImageSpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridImageSpec\" is not implemented in Swift!");
    }
  #endif
    NitroImage::HybridImageSpec_cxx swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec>
  std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec> create_std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_(void* _Nonnull swiftUnsafePointer) {
    NitroImage::HybridImageFactorySpec_cxx swiftPart = NitroImage::HybridImageFactorySpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::image::HybridImageFactorySpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_(std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_ cppType) {
    std::shared_ptr<margelo::nitro::image::HybridImageFactorySpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::image::HybridImageFactorySpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridImageFactorySpec\" is not implemented in Swift!");
    }
  #endif
    NitroImage::HybridImageFactorySpec_cxx swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>
  std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> create_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_(void* _Nonnull swiftUnsafePointer) {
    NitroImage::HybridTestObjectSwiftKotlinSpec_cxx swiftPart = NitroImage::HybridTestObjectSwiftKotlinSpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::image::HybridTestObjectSwiftKotlinSpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_(std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_ cppType) {
    std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::image::HybridTestObjectSwiftKotlinSpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridTestObjectSwiftKotlinSpec\" is not implemented in Swift!");
    }
  #endif
    NitroImage::HybridTestObjectSwiftKotlinSpec_cxx swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }
  
  // pragma MARK: std::function<void(const std::vector<Powertrain>& /* array */)>
  Func_void_std__vector_Powertrain_ create_Func_void_std__vector_Powertrain_(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__vector_Powertrain_::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::vector<Powertrain>& array) mutable -> void {
      swiftClosure.call(array);
    };
  }
  
  // pragma MARK: std::function<void()>
  Func_void create_Func_void(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)]() mutable -> void {
      swiftClosure.call();
    };
  }
  
  // pragma MARK: std::function<void(const std::exception_ptr& /* error */)>
  Func_void_std__exception_ptr create_Func_void_std__exception_ptr(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__exception_ptr::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::exception_ptr& error) mutable -> void {
      swiftClosure.call(error);
    };
  }
  
  // pragma MARK: std::function<void(int64_t /* result */)>
  Func_void_int64_t create_Func_void_int64_t(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_int64_t::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](int64_t result) mutable -> void {
      swiftClosure.call(result);
    };
  }
  
  // pragma MARK: std::function<void(double /* result */)>
  Func_void_double create_Func_void_double(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_double::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](double result) mutable -> void {
      swiftClosure.call(result);
    };
  }
  
  // pragma MARK: std::function<void(const Car& /* result */)>
  Func_void_Car create_Func_void_Car(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_Car::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const Car& result) mutable -> void {
      swiftClosure.call(result);
    };
  }
  
  // pragma MARK: std::function<void(std::optional<double> /* maybe */)>
  Func_void_std__optional_double_ create_Func_void_std__optional_double_(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__optional_double_::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](std::optional<double> maybe) mutable -> void {
      swiftClosure.call(maybe);
    };
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<double>>()>
  Func_std__shared_ptr_Promise_double__ create_Func_std__shared_ptr_Promise_double__(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_std__shared_ptr_Promise_double__::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)]() mutable -> std::shared_ptr<Promise<double>> {
      auto __result = swiftClosure.call();
      return __result;
    };
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>>()>
  Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____ create_Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_std__shared_ptr_Promise_std__shared_ptr_Promise_double____::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)]() mutable -> std::shared_ptr<Promise<std::shared_ptr<Promise<double>>>> {
      auto __result = swiftClosure.call();
      return __result;
    };
  }
  
  // pragma MARK: std::function<void(const std::shared_ptr<Promise<double>>& /* result */)>
  Func_void_std__shared_ptr_Promise_double__ create_Func_void_std__shared_ptr_Promise_double__(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__shared_ptr_Promise_double__::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::shared_ptr<Promise<double>>& result) mutable -> void {
      swiftClosure.call(result);
    };
  }
  
  // pragma MARK: std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)>
  Func_void_std__shared_ptr_ArrayBuffer_ create_Func_void_std__shared_ptr_ArrayBuffer_(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__shared_ptr_ArrayBuffer_::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::shared_ptr<ArrayBuffer>& result) mutable -> void {
      swiftClosure.call(ArrayBufferHolder(result));
    };
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>>()>
  Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____ create_Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_std__shared_ptr_Promise_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer_____::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)]() mutable -> std::shared_ptr<Promise<std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>>> {
      auto __result = swiftClosure.call();
      return __result;
    };
  }
  
  // pragma MARK: std::function<void(const std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>& /* result */)>
  Func_void_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___ create_Func_void_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_void_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)](const std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>& result) mutable -> void {
      swiftClosure.call(result);
    };
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<std::string>>()>
  Func_std__shared_ptr_Promise_std__string__ create_Func_std__shared_ptr_Promise_std__string__(void* _Nonnull swiftClosureWrapper) {
    auto swiftClosure = NitroImage::Func_std__shared_ptr_Promise_std__string__::fromUnsafe(swiftClosureWrapper);
    return [swiftClosure = std::move(swiftClosure)]() mutable -> std::shared_ptr<Promise<std::string>> {
      auto __result = swiftClosure.call();
      return __result;
    };
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridBaseSpec>
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> create_std__shared_ptr_margelo__nitro__image__HybridBaseSpec_(void* _Nonnull swiftUnsafePointer) {
    NitroImage::HybridBaseSpec_cxx swiftPart = NitroImage::HybridBaseSpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::image::HybridBaseSpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridBaseSpec_(std__shared_ptr_margelo__nitro__image__HybridBaseSpec_ cppType) {
    std::shared_ptr<margelo::nitro::image::HybridBaseSpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::image::HybridBaseSpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridBaseSpec\" is not implemented in Swift!");
    }
  #endif
    NitroImage::HybridBaseSpec_cxx swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridChildSpec>
  std::shared_ptr<margelo::nitro::image::HybridChildSpec> create_std__shared_ptr_margelo__nitro__image__HybridChildSpec_(void* _Nonnull swiftUnsafePointer) {
    NitroImage::HybridChildSpec_cxx swiftPart = NitroImage::HybridChildSpec_cxx::fromUnsafe(swiftUnsafePointer);
    return std::make_shared<margelo::nitro::image::HybridChildSpecSwift>(swiftPart);
  }
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridChildSpec_(std__shared_ptr_margelo__nitro__image__HybridChildSpec_ cppType) {
    std::shared_ptr<margelo::nitro::image::HybridChildSpecSwift> swiftWrapper = std::dynamic_pointer_cast<margelo::nitro::image::HybridChildSpecSwift>(cppType);
  #ifdef NITRO_DEBUG
    if (swiftWrapper == nullptr) [[unlikely]] {
      throw std::runtime_error("Class \"HybridChildSpec\" is not implemented in Swift!");
    }
  #endif
    NitroImage::HybridChildSpec_cxx swiftPart = swiftWrapper->getSwiftPart();
    return swiftPart.toUnsafe();
  }

} // namespace margelo::nitro::image::bridge::swift
