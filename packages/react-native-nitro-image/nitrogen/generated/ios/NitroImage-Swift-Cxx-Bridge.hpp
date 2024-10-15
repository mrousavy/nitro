///
/// NitroImage-Swift-Cxx-Bridge.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/NitroDefines.hpp>)
#include <NitroModules/NitroDefines.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif

// Forward declarations of C++ defined types
// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `HybridTestObjectCppSpecSwift` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectCppSpecSwift; }
// Forward declaration of `HybridTestObjectCppSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectCppSpec; }
// Forward declaration of `OldEnum` to properly resolve imports.
namespace margelo::nitro::image { enum class OldEnum; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }
// Forward declaration of `Powertrain` to properly resolve imports.
namespace margelo::nitro::image { enum class Powertrain; }

// Include C++ defined types
#if __has_include("Car.hpp")
 #include "Car.hpp"
#endif
#if __has_include("HybridTestObjectCppSpec.hpp")
 #include "HybridTestObjectCppSpec.hpp"
#endif
#if __has_include("HybridTestObjectCppSpecSwift.hpp")
 #include "HybridTestObjectCppSpecSwift.hpp"
#endif
#if __has_include("OldEnum.hpp")
 #include "OldEnum.hpp"
#endif
#if __has_include("Person.hpp")
 #include "Person.hpp"
#endif
#if __has_include("Powertrain.hpp")
 #include "Powertrain.hpp"
#endif
#if __has_include(<NitroModules/PromiseHolder.hpp>)
 #include <NitroModules/PromiseHolder.hpp>
#endif
#if __has_include(<functional>)
 #include <functional>
#endif
#if __has_include(<future>)
 #include <future>
#endif
#if __has_include(<memory>)
 #include <memory>
#endif
#if __has_include(<optional>)
 #include <optional>
#endif
#if __has_include(<string>)
 #include <string>
#endif
#if __has_include(<tuple>)
 #include <tuple>
#endif
#if __has_include(<variant>)
 #include <variant>
#endif
#if __has_include(<vector>)
 #include <vector>
#endif

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
  class Func_void_std__string_Wrapper {
  public:
    explicit Func_void_std__string_Wrapper(const std::function<void(const std::string& /* path */)>& func);
    explicit Func_void_std__string_Wrapper(std::function<void(const std::string& /* path */)>&& func);
    void call(std::string path) const;
    std::function<void(const std::string& /* path */)> function;
  };
  Func_void_std__string create_Func_void_std__string(void* NONNULL closureHolder, void(* NONNULL call)(void* NONNULL /* closureHolder */, std::string), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_void_std__string_Wrapper> share_Func_void_std__string(const Func_void_std__string& value);
  
  // pragma MARK: std::variant<std::string, double>
  /**
   * Wrapper struct for `std::variant<std::string, double>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_std__string__double_ {
    std::variant<std::string, double> variant;
    std__variant_std__string__double_(std::variant<std::string, double> variant);
    operator std::variant<std::string, double>() const;
    size_t index() const;
  };
  std__variant_std__string__double_ create_std__variant_std__string__double_(const std::string& value);
  std__variant_std__string__double_ create_std__variant_std__string__double_(double value);
  std::string get_std__variant_std__string__double__0(const std__variant_std__string__double_& variantWrapper);
  double get_std__variant_std__string__double__1(const std__variant_std__string__double_& variantWrapper);
  
  // pragma MARK: std::vector<double>
  /**
   * Specialized version of `std::vector<double>`.
   */
  using std__vector_double_ = std::vector<double>;
  std::vector<double> create_std__vector_double_(size_t size);
  
  // pragma MARK: std::vector<std::string>
  /**
   * Specialized version of `std::vector<std::string>`.
   */
  using std__vector_std__string_ = std::vector<std::string>;
  std::vector<std::string> create_std__vector_std__string_(size_t size);
  
  // pragma MARK: std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>
  /**
   * Wrapper struct for `std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ {
    std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>> variant;
    std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>> variant);
    operator std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>() const;
    size_t index() const;
  };
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::string& value);
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(double value);
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(bool value);
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::vector<double>& value);
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::vector<std::string>& value);
  std::string get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___0(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper);
  double get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___1(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper);
  bool get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___2(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper);
  std::vector<double> get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___3(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper);
  std::vector<std::string> get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___4(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper);
  
  // pragma MARK: std::variant<bool, OldEnum>
  /**
   * Wrapper struct for `std::variant<bool, OldEnum>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_bool__OldEnum_ {
    std::variant<bool, OldEnum> variant;
    std__variant_bool__OldEnum_(std::variant<bool, OldEnum> variant);
    operator std::variant<bool, OldEnum>() const;
    size_t index() const;
  };
  std__variant_bool__OldEnum_ create_std__variant_bool__OldEnum_(bool value);
  std__variant_bool__OldEnum_ create_std__variant_bool__OldEnum_(OldEnum value);
  bool get_std__variant_bool__OldEnum__0(const std__variant_bool__OldEnum_& variantWrapper);
  OldEnum get_std__variant_bool__OldEnum__1(const std__variant_bool__OldEnum_& variantWrapper);
  
  // pragma MARK: std::optional<Person>
  /**
   * Specialized version of `std::optional<Person>`.
   */
  using std__optional_Person_ = std::optional<Person>;
  std::optional<Person> create_std__optional_Person_(const Person& value);
  
  // pragma MARK: std::variant<Car, Person>
  /**
   * Wrapper struct for `std::variant<Car, Person>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_Car__Person_ {
    std::variant<Car, Person> variant;
    std__variant_Car__Person_(std::variant<Car, Person> variant);
    operator std::variant<Car, Person>() const;
    size_t index() const;
  };
  std__variant_Car__Person_ create_std__variant_Car__Person_(const Car& value);
  std__variant_Car__Person_ create_std__variant_Car__Person_(const Person& value);
  Car get_std__variant_Car__Person__0(const std__variant_Car__Person_& variantWrapper);
  Person get_std__variant_Car__Person__1(const std__variant_Car__Person_& variantWrapper);
  
  // pragma MARK: std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>>
  /**
   * Wrapper struct for `std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__ {
    std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>> variant;
    std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>> variant);
    operator std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>>() const;
    size_t index() const;
  };
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__ create_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(const Person& value);
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__ create_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(const std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>& value);
  Person get_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec___0(const std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__& variantWrapper);
  std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec> get_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec___1(const std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__& variantWrapper);
  
  // pragma MARK: std::tuple<double, double>
  /**
   * Specialized version of `std::tuple<double, double>`.
   */
  using std__tuple_double__double_ = std::tuple<double, double>;
  std::tuple<double, double> create_std__tuple_double__double_(double arg0, double arg1);
  
  // pragma MARK: std::tuple<double, double, double>
  /**
   * Specialized version of `std::tuple<double, double, double>`.
   */
  using std__tuple_double__double__double_ = std::tuple<double, double, double>;
  std::tuple<double, double, double> create_std__tuple_double__double__double_(double arg0, double arg1, double arg2);
  
  // pragma MARK: std::variant<std::tuple<double, double>, std::tuple<double, double, double>>
  /**
   * Wrapper struct for `std::variant<std::tuple<double, double>, std::tuple<double, double, double>>`.
   * std::variant cannot be used in Swift because of a Swift bug.
   * Not even specializing it works. So we create a wrapper struct.
   */
  struct std__variant_std__tuple_double__double___std__tuple_double__double__double__ {
    std::variant<std::tuple<double, double>, std::tuple<double, double, double>> variant;
    std__variant_std__tuple_double__double___std__tuple_double__double__double__(std::variant<std::tuple<double, double>, std::tuple<double, double, double>> variant);
    operator std::variant<std::tuple<double, double>, std::tuple<double, double, double>>() const;
    size_t index() const;
  };
  std__variant_std__tuple_double__double___std__tuple_double__double__double__ create_std__variant_std__tuple_double__double___std__tuple_double__double__double__(const std::tuple<double, double>& value);
  std__variant_std__tuple_double__double___std__tuple_double__double__double__ create_std__variant_std__tuple_double__double___std__tuple_double__double__double__(const std::tuple<double, double, double>& value);
  std::tuple<double, double> get_std__variant_std__tuple_double__double___std__tuple_double__double__double___0(const std__variant_std__tuple_double__double___std__tuple_double__double__double__& variantWrapper);
  std::tuple<double, double, double> get_std__variant_std__tuple_double__double___std__tuple_double__double__double___1(const std__variant_std__tuple_double__double___std__tuple_double__double__double__& variantWrapper);
  
  // pragma MARK: std::tuple<double, std::string>
  /**
   * Specialized version of `std::tuple<double, std::string>`.
   */
  using std__tuple_double__std__string_ = std::tuple<double, std::string>;
  std::tuple<double, std::string> create_std__tuple_double__std__string_(double arg0, const std::string& arg1);
  
  // pragma MARK: std::tuple<double, std::string, bool>
  /**
   * Specialized version of `std::tuple<double, std::string, bool>`.
   */
  using std__tuple_double__std__string__bool_ = std::tuple<double, std::string, bool>;
  std::tuple<double, std::string, bool> create_std__tuple_double__std__string__bool_(double arg0, const std::string& arg1, bool arg2);
  
  // pragma MARK: PromiseHolder<double>
  /**
   * Specialized version of `PromiseHolder<double>`.
   */
  using PromiseHolder_double_ = PromiseHolder<double>;
  PromiseHolder<double> create_PromiseHolder_double_();
  
  // pragma MARK: std::function<std::future<double>()>
  /**
   * Specialized version of `std::function<std::future<double>()>`.
   */
  using Func_std__future_double_ = std::function<std::future<double>()>;
  /**
   * Wrapper class for a `std::function<std::future<double>()>`, this can be used from Swift.
   */
  class Func_std__future_double__Wrapper {
  public:
    explicit Func_std__future_double__Wrapper(const std::function<std::future<double>()>& func);
    explicit Func_std__future_double__Wrapper(std::function<std::future<double>()>&& func);
    PromiseHolder<double> call() const;
    std::function<std::future<double>()> function;
  };
  Func_std__future_double_ create_Func_std__future_double_(void* NONNULL closureHolder, PromiseHolder<double>(* NONNULL call)(void* NONNULL /* closureHolder */), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_std__future_double__Wrapper> share_Func_std__future_double_(const Func_std__future_double_& value);
  
  // pragma MARK: PromiseHolder<void>
  /**
   * Specialized version of `PromiseHolder<void>`.
   */
  using PromiseHolder_void_ = PromiseHolder<void>;
  PromiseHolder<void> create_PromiseHolder_void_();
  
  // pragma MARK: std::function<std::future<std::string>()>
  /**
   * Specialized version of `std::function<std::future<std::string>()>`.
   */
  using Func_std__future_std__string_ = std::function<std::future<std::string>()>;
  /**
   * Wrapper class for a `std::function<std::future<std::string>()>`, this can be used from Swift.
   */
  class Func_std__future_std__string__Wrapper {
  public:
    explicit Func_std__future_std__string__Wrapper(const std::function<std::future<std::string>()>& func);
    explicit Func_std__future_std__string__Wrapper(std::function<std::future<std::string>()>&& func);
    PromiseHolder<std::string> call() const;
    std::function<std::future<std::string>()> function;
  };
  Func_std__future_std__string_ create_Func_std__future_std__string_(void* NONNULL closureHolder, PromiseHolder<std::string>(* NONNULL call)(void* NONNULL /* closureHolder */), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_std__future_std__string__Wrapper> share_Func_std__future_std__string_(const Func_std__future_std__string_& value);
  
  // pragma MARK: PromiseHolder<std::string>
  /**
   * Specialized version of `PromiseHolder<std::string>`.
   */
  using PromiseHolder_std__string_ = PromiseHolder<std::string>;
  PromiseHolder<std::string> create_PromiseHolder_std__string_();
  
  // pragma MARK: std::optional<std::string>
  /**
   * Specialized version of `std::optional<std::string>`.
   */
  using std__optional_std__string_ = std::optional<std::string>;
  std::optional<std::string> create_std__optional_std__string_(const std::string& value);
  
  // pragma MARK: std::optional<std::vector<std::string>>
  /**
   * Specialized version of `std::optional<std::vector<std::string>>`.
   */
  using std__optional_std__vector_std__string__ = std::optional<std::vector<std::string>>;
  std::optional<std::vector<std::string>> create_std__optional_std__vector_std__string__(const std::vector<std::string>& value);
  
  // pragma MARK: std::vector<Person>
  /**
   * Specialized version of `std::vector<Person>`.
   */
  using std__vector_Person_ = std::vector<Person>;
  std::vector<Person> create_std__vector_Person_(size_t size);
  
  // pragma MARK: std::vector<Powertrain>
  /**
   * Specialized version of `std::vector<Powertrain>`.
   */
  using std__vector_Powertrain_ = std::vector<Powertrain>;
  std::vector<Powertrain> create_std__vector_Powertrain_(size_t size);
  
  // pragma MARK: std::function<void(const std::vector<Powertrain>& /* array */)>
  /**
   * Specialized version of `std::function<void(const std::vector<Powertrain>&)>`.
   */
  using Func_void_std__vector_Powertrain_ = std::function<void(const std::vector<Powertrain>& /* array */)>;
  /**
   * Wrapper class for a `std::function<void(const std::vector<Powertrain>& / * array * /)>`, this can be used from Swift.
   */
  class Func_void_std__vector_Powertrain__Wrapper {
  public:
    explicit Func_void_std__vector_Powertrain__Wrapper(const std::function<void(const std::vector<Powertrain>& /* array */)>& func);
    explicit Func_void_std__vector_Powertrain__Wrapper(std::function<void(const std::vector<Powertrain>& /* array */)>&& func);
    void call(std::vector<Powertrain> array) const;
    std::function<void(const std::vector<Powertrain>& /* array */)> function;
  };
  Func_void_std__vector_Powertrain_ create_Func_void_std__vector_Powertrain_(void* NONNULL closureHolder, void(* NONNULL call)(void* NONNULL /* closureHolder */, std::vector<Powertrain>), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_void_std__vector_Powertrain__Wrapper> share_Func_void_std__vector_Powertrain_(const Func_void_std__vector_Powertrain_& value);
  
  // pragma MARK: std::optional<bool>
  /**
   * Specialized version of `std::optional<bool>`.
   */
  using std__optional_bool_ = std::optional<bool>;
  std::optional<bool> create_std__optional_bool_(const bool& value);
  
  // pragma MARK: std::optional<Powertrain>
  /**
   * Specialized version of `std::optional<Powertrain>`.
   */
  using std__optional_Powertrain_ = std::optional<Powertrain>;
  std::optional<Powertrain> create_std__optional_Powertrain_(const Powertrain& value);
  
  // pragma MARK: PromiseHolder<int64_t>
  /**
   * Specialized version of `PromiseHolder<int64_t>`.
   */
  using PromiseHolder_int64_t_ = PromiseHolder<int64_t>;
  PromiseHolder<int64_t> create_PromiseHolder_int64_t_();
  
  // pragma MARK: std::function<void()>
  /**
   * Specialized version of `std::function<void()>`.
   */
  using Func_void = std::function<void()>;
  /**
   * Wrapper class for a `std::function<void()>`, this can be used from Swift.
   */
  class Func_void_Wrapper {
  public:
    explicit Func_void_Wrapper(const std::function<void()>& func);
    explicit Func_void_Wrapper(std::function<void()>&& func);
    void call() const;
    std::function<void()> function;
  };
  Func_void create_Func_void(void* NONNULL closureHolder, void(* NONNULL call)(void* NONNULL /* closureHolder */), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_void_Wrapper> share_Func_void(const Func_void& value);
  
  // pragma MARK: std::optional<double>
  /**
   * Specialized version of `std::optional<double>`.
   */
  using std__optional_double_ = std::optional<double>;
  std::optional<double> create_std__optional_double_(const double& value);
  
  // pragma MARK: std::function<void(std::optional<double> /* maybe */)>
  /**
   * Specialized version of `std::function<void(std::optional<double>)>`.
   */
  using Func_void_std__optional_double_ = std::function<void(std::optional<double> /* maybe */)>;
  /**
   * Wrapper class for a `std::function<void(std::optional<double> / * maybe * /)>`, this can be used from Swift.
   */
  class Func_void_std__optional_double__Wrapper {
  public:
    explicit Func_void_std__optional_double__Wrapper(const std::function<void(std::optional<double> /* maybe */)>& func);
    explicit Func_void_std__optional_double__Wrapper(std::function<void(std::optional<double> /* maybe */)>&& func);
    void call(std::optional<double> maybe) const;
    std::function<void(std::optional<double> /* maybe */)> function;
  };
  Func_void_std__optional_double_ create_Func_void_std__optional_double_(void* NONNULL closureHolder, void(* NONNULL call)(void* NONNULL /* closureHolder */, std::optional<double>), void(* NONNULL destroy)(void* NONNULL));
  std::shared_ptr<Func_void_std__optional_double__Wrapper> share_Func_void_std__optional_double_(const Func_void_std__optional_double_& value);

} // namespace margelo::nitro::image::bridge::swift

#include "NitroImage-Swift-Cxx-Umbrella.hpp"
