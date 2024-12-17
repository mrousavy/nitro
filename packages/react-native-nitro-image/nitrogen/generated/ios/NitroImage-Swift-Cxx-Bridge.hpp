///
/// NitroImage-Swift-Cxx-Bridge.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

// Forward declarations of C++ defined types
// Forward declaration of `ArrayBufferHolder` to properly resolve imports.
namespace NitroModules { class ArrayBufferHolder; }
// Forward declaration of `ArrayBuffer` to properly resolve imports.
namespace NitroModules { class ArrayBuffer; }
// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `HybridBaseSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpec; }
// Forward declaration of `HybridChildSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridChildSpec; }
// Forward declaration of `HybridImageFactorySpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridImageFactorySpec; }
// Forward declaration of `HybridImageSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridImageSpec; }
// Forward declaration of `HybridTestObjectSwiftKotlinSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectSwiftKotlinSpec; }
// Forward declaration of `OldEnum` to properly resolve imports.
namespace margelo::nitro::image { enum class OldEnum; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }
// Forward declaration of `Powertrain` to properly resolve imports.
namespace margelo::nitro::image { enum class Powertrain; }

// Forward declarations of Swift defined types
// Forward declaration of `HybridBaseSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridBaseSpec_cxx; }
// Forward declaration of `HybridChildSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridChildSpec_cxx; }
// Forward declaration of `HybridImageFactorySpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridImageFactorySpec_cxx; }
// Forward declaration of `HybridImageSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridImageSpec_cxx; }
// Forward declaration of `HybridTestObjectSwiftKotlinSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridTestObjectSwiftKotlinSpec_cxx; }

// Include C++ defined types
#include "Car.hpp"
#include "HybridBaseSpec.hpp"
#include "HybridChildSpec.hpp"
#include "HybridImageFactorySpec.hpp"
#include "HybridImageSpec.hpp"
#include "HybridTestObjectSwiftKotlinSpec.hpp"
#include "OldEnum.hpp"
#include "Person.hpp"
#include "Powertrain.hpp"
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/ArrayBufferHolder.hpp>
#include <NitroModules/Promise.hpp>
#include <exception>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <variant>
#include <vector>

/**
 * Contains specialized versions of C++ templated types so they can be accessed from Swift,
 * as well as helper functions to interact with those C++ types from Swift.
 */
namespace margelo::nitro::image::bridge::swift {

  // pragma MARK: std::function<void(const std::string& /* path */)>
  /**
   * Specialized version of `std::function<void(const std::string&)>`.
   */
  using Func_void_std__string = std::function<void(const std::string& /* path */)>;
  /**
   * Wrapper class for a `std::function<void(const std::string& / * path * /)>`, this can be used from Swift.
   */
  class Func_void_std__string_Wrapper final {
  public:
    explicit Func_void_std__string_Wrapper(const std::function<void(const std::string& /* path */)>& func): _function(func) {}
    explicit Func_void_std__string_Wrapper(std::function<void(const std::string& /* path */)>&& func): _function(std::move(func)) {}
    inline void call(std::string path) const {
      _function(path);
    }
  private:
    std::function<void(const std::string& /* path */)> _function;
  };
  inline Func_void_std__string create_Func_void_std__string(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, std::string), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__string([sharedClosureHolder, call](const std::string& path) -> void {
      call(sharedClosureHolder.get(), path);
    });
  }
  inline std::shared_ptr<Func_void_std__string_Wrapper> share_Func_void_std__string(const Func_void_std__string& value) {
    return std::make_shared<Func_void_std__string_Wrapper>(value);
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridImageSpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::image::HybridImageSpec>`.
   */
  using std__shared_ptr_margelo__nitro__image__HybridImageSpec_ = std::shared_ptr<margelo::nitro::image::HybridImageSpec>;
  std::shared_ptr<margelo::nitro::image::HybridImageSpec> create_std__shared_ptr_margelo__nitro__image__HybridImageSpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridImageSpec_(std__shared_ptr_margelo__nitro__image__HybridImageSpec_ cppType);
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec>`.
   */
  using std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_ = std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec>;
  std::shared_ptr<margelo::nitro::image::HybridImageFactorySpec> create_std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_(std__shared_ptr_margelo__nitro__image__HybridImageFactorySpec_ cppType);
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>`.
   */
  using std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_ = std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>;
  std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec> create_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_(std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec_ cppType);
  
  // pragma MARK: std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>
  /**
   * Specialized version of `std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>`.
   */
  using std__optional_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec__ = std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>;
  inline std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>> create_std__optional_std__shared_ptr_margelo__nitro__image__HybridTestObjectSwiftKotlinSpec__(const std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>& value) {
    return std::optional<std::shared_ptr<margelo::nitro::image::HybridTestObjectSwiftKotlinSpec>>(value);
  }
  
  // pragma MARK: std::optional<std::string>
  /**
   * Specialized version of `std::optional<std::string>`.
   */
  using std__optional_std__string_ = std::optional<std::string>;
  inline std::optional<std::string> create_std__optional_std__string_(const std::string& value) {
    return std::optional<std::string>(value);
  }
  
  // pragma MARK: std::vector<std::string>
  /**
   * Specialized version of `std::vector<std::string>`.
   */
  using std__vector_std__string_ = std::vector<std::string>;
  inline std::vector<std::string> create_std__vector_std__string_(size_t size) {
    std::vector<std::string> vector;
    vector.reserve(size);
    return vector;
  }
  
  // pragma MARK: std::optional<std::vector<std::string>>
  /**
   * Specialized version of `std::optional<std::vector<std::string>>`.
   */
  using std__optional_std__vector_std__string__ = std::optional<std::vector<std::string>>;
  inline std::optional<std::vector<std::string>> create_std__optional_std__vector_std__string__(const std::vector<std::string>& value) {
    return std::optional<std::vector<std::string>>(value);
  }
  
  // pragma MARK: std::optional<Powertrain>
  /**
   * Specialized version of `std::optional<Powertrain>`.
   */
  using std__optional_Powertrain_ = std::optional<Powertrain>;
  inline std::optional<Powertrain> create_std__optional_Powertrain_(const Powertrain& value) {
    return std::optional<Powertrain>(value);
  }
  
  // pragma MARK: std::optional<OldEnum>
  /**
   * Specialized version of `std::optional<OldEnum>`.
   */
  using std__optional_OldEnum_ = std::optional<OldEnum>;
  inline std::optional<OldEnum> create_std__optional_OldEnum_(const OldEnum& value) {
    return std::optional<OldEnum>(value);
  }
  
  // pragma MARK: std::vector<double>
  /**
   * Specialized version of `std::vector<double>`.
   */
  using std__vector_double_ = std::vector<double>;
  inline std::vector<double> create_std__vector_double_(size_t size) {
    std::vector<double> vector;
    vector.reserve(size);
    return vector;
  }
  
  // pragma MARK: std::vector<Person>
  /**
   * Specialized version of `std::vector<Person>`.
   */
  using std__vector_Person_ = std::vector<Person>;
  inline std::vector<Person> create_std__vector_Person_(size_t size) {
    std::vector<Person> vector;
    vector.reserve(size);
    return vector;
  }
  
  // pragma MARK: std::vector<Powertrain>
  /**
   * Specialized version of `std::vector<Powertrain>`.
   */
  using std__vector_Powertrain_ = std::vector<Powertrain>;
  inline std::vector<Powertrain> create_std__vector_Powertrain_(size_t size) {
    std::vector<Powertrain> vector;
    vector.reserve(size);
    return vector;
  }
  
  // pragma MARK: std::function<void(const std::vector<Powertrain>& /* array */)>
  /**
   * Specialized version of `std::function<void(const std::vector<Powertrain>&)>`.
   */
  using Func_void_std__vector_Powertrain_ = std::function<void(const std::vector<Powertrain>& /* array */)>;
  /**
   * Wrapper class for a `std::function<void(const std::vector<Powertrain>& / * array * /)>`, this can be used from Swift.
   */
  class Func_void_std__vector_Powertrain__Wrapper final {
  public:
    explicit Func_void_std__vector_Powertrain__Wrapper(const std::function<void(const std::vector<Powertrain>& /* array */)>& func): _function(func) {}
    explicit Func_void_std__vector_Powertrain__Wrapper(std::function<void(const std::vector<Powertrain>& /* array */)>&& func): _function(std::move(func)) {}
    inline void call(std::vector<Powertrain> array) const {
      _function(array);
    }
  private:
    std::function<void(const std::vector<Powertrain>& /* array */)> _function;
  };
  inline Func_void_std__vector_Powertrain_ create_Func_void_std__vector_Powertrain_(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, std::vector<Powertrain>), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__vector_Powertrain_([sharedClosureHolder, call](const std::vector<Powertrain>& array) -> void {
      call(sharedClosureHolder.get(), array);
    });
  }
  inline std::shared_ptr<Func_void_std__vector_Powertrain__Wrapper> share_Func_void_std__vector_Powertrain_(const Func_void_std__vector_Powertrain_& value) {
    return std::make_shared<Func_void_std__vector_Powertrain__Wrapper>(value);
  }
  
  // pragma MARK: std::optional<bool>
  /**
   * Specialized version of `std::optional<bool>`.
   */
  using std__optional_bool_ = std::optional<bool>;
  inline std::optional<bool> create_std__optional_bool_(const bool& value) {
    return std::optional<bool>(value);
  }
  
  // pragma MARK: std::variant<std::string, double>
  /**
   * Wrapper struct for `std::variant<std::string, double>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_std__string__double_ {
    std::variant<std::string, double> variant;
    std__variant_std__string__double_(std::variant<std::string, double> variant): variant(variant) { }
    operator std::variant<std::string, double>() const {
      return variant;
    }
    inline size_t index() const {
      return variant.index();
    }
  };
  inline std__variant_std__string__double_ create_std__variant_std__string__double_(const std::string& value) {
    return std__variant_std__string__double_(value);
  }
  inline std__variant_std__string__double_ create_std__variant_std__string__double_(double value) {
    return std__variant_std__string__double_(value);
  }
  inline std::string get_std__variant_std__string__double__0(const std__variant_std__string__double_& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  inline double get_std__variant_std__string__double__1(const std__variant_std__string__double_& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  // pragma MARK: std::shared_ptr<Promise<int64_t>>
  /**
   * Specialized version of `std::shared_ptr<Promise<int64_t>>`.
   */
  using std__shared_ptr_Promise_int64_t__ = std::shared_ptr<Promise<int64_t>>;
  inline std::shared_ptr<Promise<int64_t>> create_std__shared_ptr_Promise_int64_t__() {
    return Promise<int64_t>::create();
  }
  
  // pragma MARK: std::function<void(int64_t /* result */)>
  /**
   * Specialized version of `std::function<void(int64_t)>`.
   */
  using Func_void_int64_t = std::function<void(int64_t /* result */)>;
  /**
   * Wrapper class for a `std::function<void(int64_t / * result * /)>`, this can be used from Swift.
   */
  class Func_void_int64_t_Wrapper final {
  public:
    explicit Func_void_int64_t_Wrapper(const std::function<void(int64_t /* result */)>& func): _function(func) {}
    explicit Func_void_int64_t_Wrapper(std::function<void(int64_t /* result */)>&& func): _function(std::move(func)) {}
    inline void call(int64_t result) const {
      _function(result);
    }
  private:
    std::function<void(int64_t /* result */)> _function;
  };
  inline Func_void_int64_t create_Func_void_int64_t(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, int64_t), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_int64_t([sharedClosureHolder, call](int64_t result) -> void {
      call(sharedClosureHolder.get(), result);
    });
  }
  inline std::shared_ptr<Func_void_int64_t_Wrapper> share_Func_void_int64_t(const Func_void_int64_t& value) {
    return std::make_shared<Func_void_int64_t_Wrapper>(value);
  }
  
  // pragma MARK: std::function<void(const std::exception_ptr& /* error */)>
  /**
   * Specialized version of `std::function<void(const std::exception_ptr&)>`.
   */
  using Func_void_std__exception_ptr = std::function<void(const std::exception_ptr& /* error */)>;
  /**
   * Wrapper class for a `std::function<void(const std::exception_ptr& / * error * /)>`, this can be used from Swift.
   */
  class Func_void_std__exception_ptr_Wrapper final {
  public:
    explicit Func_void_std__exception_ptr_Wrapper(const std::function<void(const std::exception_ptr& /* error */)>& func): _function(func) {}
    explicit Func_void_std__exception_ptr_Wrapper(std::function<void(const std::exception_ptr& /* error */)>&& func): _function(std::move(func)) {}
    inline void call(std::exception_ptr error) const {
      _function(error);
    }
  private:
    std::function<void(const std::exception_ptr& /* error */)> _function;
  };
  inline Func_void_std__exception_ptr create_Func_void_std__exception_ptr(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, std::exception_ptr), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__exception_ptr([sharedClosureHolder, call](const std::exception_ptr& error) -> void {
      call(sharedClosureHolder.get(), error);
    });
  }
  inline std::shared_ptr<Func_void_std__exception_ptr_Wrapper> share_Func_void_std__exception_ptr(const Func_void_std__exception_ptr& value) {
    return std::make_shared<Func_void_std__exception_ptr_Wrapper>(value);
  }
  
  // pragma MARK: std::shared_ptr<Promise<void>>
  /**
   * Specialized version of `std::shared_ptr<Promise<void>>`.
   */
  using std__shared_ptr_Promise_void__ = std::shared_ptr<Promise<void>>;
  inline std::shared_ptr<Promise<void>> create_std__shared_ptr_Promise_void__() {
    return Promise<void>::create();
  }
  
  // pragma MARK: std::function<void()>
  /**
   * Specialized version of `std::function<void()>`.
   */
  using Func_void = std::function<void()>;
  /**
   * Wrapper class for a `std::function<void()>`, this can be used from Swift.
   */
  class Func_void_Wrapper final {
  public:
    explicit Func_void_Wrapper(const std::function<void()>& func): _function(func) {}
    explicit Func_void_Wrapper(std::function<void()>&& func): _function(std::move(func)) {}
    inline void call() const {
      _function();
    }
  private:
    std::function<void()> _function;
  };
  inline Func_void create_Func_void(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void([sharedClosureHolder, call]() -> void {
      call(sharedClosureHolder.get());
    });
  }
  inline std::shared_ptr<Func_void_Wrapper> share_Func_void(const Func_void& value) {
    return std::make_shared<Func_void_Wrapper>(value);
  }
  
  // pragma MARK: std::shared_ptr<Promise<double>>
  /**
   * Specialized version of `std::shared_ptr<Promise<double>>`.
   */
  using std__shared_ptr_Promise_double__ = std::shared_ptr<Promise<double>>;
  inline std::shared_ptr<Promise<double>> create_std__shared_ptr_Promise_double__() {
    return Promise<double>::create();
  }
  
  // pragma MARK: std::function<void(double /* result */)>
  /**
   * Specialized version of `std::function<void(double)>`.
   */
  using Func_void_double = std::function<void(double /* result */)>;
  /**
   * Wrapper class for a `std::function<void(double / * result * /)>`, this can be used from Swift.
   */
  class Func_void_double_Wrapper final {
  public:
    explicit Func_void_double_Wrapper(const std::function<void(double /* result */)>& func): _function(func) {}
    explicit Func_void_double_Wrapper(std::function<void(double /* result */)>&& func): _function(std::move(func)) {}
    inline void call(double result) const {
      _function(result);
    }
  private:
    std::function<void(double /* result */)> _function;
  };
  inline Func_void_double create_Func_void_double(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, double), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_double([sharedClosureHolder, call](double result) -> void {
      call(sharedClosureHolder.get(), result);
    });
  }
  inline std::shared_ptr<Func_void_double_Wrapper> share_Func_void_double(const Func_void_double& value) {
    return std::make_shared<Func_void_double_Wrapper>(value);
  }
  
  // pragma MARK: std::optional<Person>
  /**
   * Specialized version of `std::optional<Person>`.
   */
  using std__optional_Person_ = std::optional<Person>;
  inline std::optional<Person> create_std__optional_Person_(const Person& value) {
    return std::optional<Person>(value);
  }
  
  // pragma MARK: std::shared_ptr<Promise<Car>>
  /**
   * Specialized version of `std::shared_ptr<Promise<Car>>`.
   */
  using std__shared_ptr_Promise_Car__ = std::shared_ptr<Promise<Car>>;
  inline std::shared_ptr<Promise<Car>> create_std__shared_ptr_Promise_Car__() {
    return Promise<Car>::create();
  }
  
  // pragma MARK: std::function<void(const Car& /* result */)>
  /**
   * Specialized version of `std::function<void(const Car&)>`.
   */
  using Func_void_Car = std::function<void(const Car& /* result */)>;
  /**
   * Wrapper class for a `std::function<void(const Car& / * result * /)>`, this can be used from Swift.
   */
  class Func_void_Car_Wrapper final {
  public:
    explicit Func_void_Car_Wrapper(const std::function<void(const Car& /* result */)>& func): _function(func) {}
    explicit Func_void_Car_Wrapper(std::function<void(const Car& /* result */)>&& func): _function(std::move(func)) {}
    inline void call(Car result) const {
      _function(result);
    }
  private:
    std::function<void(const Car& /* result */)> _function;
  };
  inline Func_void_Car create_Func_void_Car(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, Car), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_Car([sharedClosureHolder, call](const Car& result) -> void {
      call(sharedClosureHolder.get(), result);
    });
  }
  inline std::shared_ptr<Func_void_Car_Wrapper> share_Func_void_Car(const Func_void_Car& value) {
    return std::make_shared<Func_void_Car_Wrapper>(value);
  }
  
  // pragma MARK: std::optional<double>
  /**
   * Specialized version of `std::optional<double>`.
   */
  using std__optional_double_ = std::optional<double>;
  inline std::optional<double> create_std__optional_double_(const double& value) {
    return std::optional<double>(value);
  }
  
  // pragma MARK: std::function<void(std::optional<double> /* maybe */)>
  /**
   * Specialized version of `std::function<void(std::optional<double>)>`.
   */
  using Func_void_std__optional_double_ = std::function<void(std::optional<double> /* maybe */)>;
  /**
   * Wrapper class for a `std::function<void(std::optional<double> / * maybe * /)>`, this can be used from Swift.
   */
  class Func_void_std__optional_double__Wrapper final {
  public:
    explicit Func_void_std__optional_double__Wrapper(const std::function<void(std::optional<double> /* maybe */)>& func): _function(func) {}
    explicit Func_void_std__optional_double__Wrapper(std::function<void(std::optional<double> /* maybe */)>&& func): _function(std::move(func)) {}
    inline void call(std::optional<double> maybe) const {
      _function(maybe);
    }
  private:
    std::function<void(std::optional<double> /* maybe */)> _function;
  };
  inline Func_void_std__optional_double_ create_Func_void_std__optional_double_(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, std::optional<double>), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__optional_double_([sharedClosureHolder, call](std::optional<double> maybe) -> void {
      call(sharedClosureHolder.get(), maybe);
    });
  }
  inline std::shared_ptr<Func_void_std__optional_double__Wrapper> share_Func_void_std__optional_double_(const Func_void_std__optional_double_& value) {
    return std::make_shared<Func_void_std__optional_double__Wrapper>(value);
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<double>>()>
  /**
   * Specialized version of `std::function<std::shared_ptr<Promise<double>>()>`.
   */
  using Func_std__shared_ptr_Promise_double__ = std::function<std::shared_ptr<Promise<double>>()>;
  /**
   * Wrapper class for a `std::function<std::shared_ptr<Promise<double>>()>`, this can be used from Swift.
   */
  class Func_std__shared_ptr_Promise_double___Wrapper final {
  public:
    explicit Func_std__shared_ptr_Promise_double___Wrapper(const std::function<std::shared_ptr<Promise<double>>()>& func): _function(func) {}
    explicit Func_std__shared_ptr_Promise_double___Wrapper(std::function<std::shared_ptr<Promise<double>>()>&& func): _function(std::move(func)) {}
    inline std::shared_ptr<Promise<double>> call() const {
      auto __result = _function();
      return __result;
    }
  private:
    std::function<std::shared_ptr<Promise<double>>()> _function;
  };
  inline Func_std__shared_ptr_Promise_double__ create_Func_std__shared_ptr_Promise_double__(void* _Nonnull closureHolder, std::shared_ptr<Promise<double>>(* _Nonnull call)(void* _Nonnull /* closureHolder */), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_std__shared_ptr_Promise_double__([sharedClosureHolder, call]() -> std::shared_ptr<Promise<double>> {
      auto __result = call(sharedClosureHolder.get());
      return __result;
    });
  }
  inline std::shared_ptr<Func_std__shared_ptr_Promise_double___Wrapper> share_Func_std__shared_ptr_Promise_double__(const Func_std__shared_ptr_Promise_double__& value) {
    return std::make_shared<Func_std__shared_ptr_Promise_double___Wrapper>(value);
  }
  
  // pragma MARK: std::function<std::shared_ptr<Promise<std::string>>()>
  /**
   * Specialized version of `std::function<std::shared_ptr<Promise<std::string>>()>`.
   */
  using Func_std__shared_ptr_Promise_std__string__ = std::function<std::shared_ptr<Promise<std::string>>()>;
  /**
   * Wrapper class for a `std::function<std::shared_ptr<Promise<std::string>>()>`, this can be used from Swift.
   */
  class Func_std__shared_ptr_Promise_std__string___Wrapper final {
  public:
    explicit Func_std__shared_ptr_Promise_std__string___Wrapper(const std::function<std::shared_ptr<Promise<std::string>>()>& func): _function(func) {}
    explicit Func_std__shared_ptr_Promise_std__string___Wrapper(std::function<std::shared_ptr<Promise<std::string>>()>&& func): _function(std::move(func)) {}
    inline std::shared_ptr<Promise<std::string>> call() const {
      auto __result = _function();
      return __result;
    }
  private:
    std::function<std::shared_ptr<Promise<std::string>>()> _function;
  };
  inline Func_std__shared_ptr_Promise_std__string__ create_Func_std__shared_ptr_Promise_std__string__(void* _Nonnull closureHolder, std::shared_ptr<Promise<std::string>>(* _Nonnull call)(void* _Nonnull /* closureHolder */), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_std__shared_ptr_Promise_std__string__([sharedClosureHolder, call]() -> std::shared_ptr<Promise<std::string>> {
      auto __result = call(sharedClosureHolder.get());
      return __result;
    });
  }
  inline std::shared_ptr<Func_std__shared_ptr_Promise_std__string___Wrapper> share_Func_std__shared_ptr_Promise_std__string__(const Func_std__shared_ptr_Promise_std__string__& value) {
    return std::make_shared<Func_std__shared_ptr_Promise_std__string___Wrapper>(value);
  }
  
  // pragma MARK: std::shared_ptr<Promise<std::string>>
  /**
   * Specialized version of `std::shared_ptr<Promise<std::string>>`.
   */
  using std__shared_ptr_Promise_std__string__ = std::shared_ptr<Promise<std::string>>;
  inline std::shared_ptr<Promise<std::string>> create_std__shared_ptr_Promise_std__string__() {
    return Promise<std::string>::create();
  }
  
  // pragma MARK: std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>
  /**
   * Specialized version of `std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>`.
   */
  using std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___ = std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>;
  inline std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> create_std__shared_ptr_Promise_std__shared_ptr_ArrayBuffer___() {
    return Promise<std::shared_ptr<ArrayBuffer>>::create();
  }
  
  // pragma MARK: std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)>
  /**
   * Specialized version of `std::function<void(const std::shared_ptr<ArrayBuffer>&)>`.
   */
  using Func_void_std__shared_ptr_ArrayBuffer_ = std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)>;
  /**
   * Wrapper class for a `std::function<void(const std::shared_ptr<ArrayBuffer>& / * result * /)>`, this can be used from Swift.
   */
  class Func_void_std__shared_ptr_ArrayBuffer__Wrapper final {
  public:
    explicit Func_void_std__shared_ptr_ArrayBuffer__Wrapper(const std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)>& func): _function(func) {}
    explicit Func_void_std__shared_ptr_ArrayBuffer__Wrapper(std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)>&& func): _function(std::move(func)) {}
    inline void call(ArrayBufferHolder result) const {
      _function(result.getArrayBuffer());
    }
  private:
    std::function<void(const std::shared_ptr<ArrayBuffer>& /* result */)> _function;
  };
  inline Func_void_std__shared_ptr_ArrayBuffer_ create_Func_void_std__shared_ptr_ArrayBuffer_(void* _Nonnull closureHolder, void(* _Nonnull call)(void* _Nonnull /* closureHolder */, ArrayBufferHolder), void(* _Nonnull destroy)(void* _Nonnull)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__shared_ptr_ArrayBuffer_([sharedClosureHolder, call](const std::shared_ptr<ArrayBuffer>& result) -> void {
      call(sharedClosureHolder.get(), ArrayBufferHolder(result));
    });
  }
  inline std::shared_ptr<Func_void_std__shared_ptr_ArrayBuffer__Wrapper> share_Func_void_std__shared_ptr_ArrayBuffer_(const Func_void_std__shared_ptr_ArrayBuffer_& value) {
    return std::make_shared<Func_void_std__shared_ptr_ArrayBuffer__Wrapper>(value);
  }
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridBaseSpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::image::HybridBaseSpec>`.
   */
  using std__shared_ptr_margelo__nitro__image__HybridBaseSpec_ = std::shared_ptr<margelo::nitro::image::HybridBaseSpec>;
  std::shared_ptr<margelo::nitro::image::HybridBaseSpec> create_std__shared_ptr_margelo__nitro__image__HybridBaseSpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridBaseSpec_(std__shared_ptr_margelo__nitro__image__HybridBaseSpec_ cppType);
  
  // pragma MARK: std::shared_ptr<margelo::nitro::image::HybridChildSpec>
  /**
   * Specialized version of `std::shared_ptr<margelo::nitro::image::HybridChildSpec>`.
   */
  using std__shared_ptr_margelo__nitro__image__HybridChildSpec_ = std::shared_ptr<margelo::nitro::image::HybridChildSpec>;
  std::shared_ptr<margelo::nitro::image::HybridChildSpec> create_std__shared_ptr_margelo__nitro__image__HybridChildSpec_(void* _Nonnull swiftUnsafePointer);
  void* _Nonnull get_std__shared_ptr_margelo__nitro__image__HybridChildSpec_(std__shared_ptr_margelo__nitro__image__HybridChildSpec_ cppType);

} // namespace margelo::nitro::image::bridge::swift
