///
/// NitroImage-Swift-Cxx-Bridge.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

#include "NitroImage-Swift-Cxx-Bridge.hpp"

namespace margelo::nitro::image::bridge::swift {

  Func_void_std__string_Wrapper::Func_void_std__string_Wrapper(const std::function<void(const std::string& /* path */)>& func): function(func) {}
  Func_void_std__string_Wrapper::Func_void_std__string_Wrapper(std::function<void(const std::string& /* path */)>&& func): function(std::move(func)) {}
  void Func_void_std__string_Wrapper::call(std::string path) const {
    function(path);
  }
  Func_void_std__string create_Func_void_std__string(void* closureHolder, void(*call)(void* /* closureHolder */, std::string), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__string([sharedClosureHolder, call](const std::string& path) -> void {
      call(sharedClosureHolder.get(), path);
    });
  }
  std::shared_ptr<Func_void_std__string_Wrapper> share_Func_void_std__string(const Func_void_std__string& value) {
    return std::make_shared<Func_void_std__string_Wrapper>(value);
  }
  
  std__variant_std__string__double_::std__variant_std__string__double_(std::variant<std::string, double> variant): variant(variant) { }
  std__variant_std__string__double_::operator std::variant<std::string, double>() const {
    return variant;
  }
  size_t std__variant_std__string__double_::index() const {
      return variant.index();
    }
  std__variant_std__string__double_ create_std__variant_std__string__double_(const std::string& value) {
    return std__variant_std__string__double_(value);
  }
  std__variant_std__string__double_ create_std__variant_std__string__double_(double value) {
    return std__variant_std__string__double_(value);
  }
  std::string get_std__variant_std__string__double__0(const std__variant_std__string__double_& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  double get_std__variant_std__string__double__1(const std__variant_std__string__double_& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  std::vector<double> create_std__vector_double_(size_t size) {
    std::vector<double> vector;
    vector.reserve(size);
    return vector;
  }
  
  std::vector<std::string> create_std__vector_std__string_(size_t size) {
    std::vector<std::string> vector;
    vector.reserve(size);
    return vector;
  }
  
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__::std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>> variant): variant(variant) { }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__::operator std::variant<std::string, double, bool, std::vector<double>, std::vector<std::string>>() const {
    return variant;
  }
  size_t std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__::index() const {
      return variant.index();
    }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::string& value) {
    return std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(value);
  }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(double value) {
    return std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(value);
  }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(bool value) {
    return std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(value);
  }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::vector<double>& value) {
    return std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(value);
  }
  std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__ create_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(const std::vector<std::string>& value) {
    return std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__(value);
  }
  std::string get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___0(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  double get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___1(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  bool get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___2(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper) {
    return std::get<2>(variantWrapper.variant);
  }
  std::vector<double> get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___3(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper) {
    return std::get<3>(variantWrapper.variant);
  }
  std::vector<std::string> get_std__variant_std__string__double__bool__std__vector_double___std__vector_std__string___4(const std__variant_std__string__double__bool__std__vector_double___std__vector_std__string__& variantWrapper) {
    return std::get<4>(variantWrapper.variant);
  }
  
  std__variant_bool__OldEnum_::std__variant_bool__OldEnum_(std::variant<bool, OldEnum> variant): variant(variant) { }
  std__variant_bool__OldEnum_::operator std::variant<bool, OldEnum>() const {
    return variant;
  }
  size_t std__variant_bool__OldEnum_::index() const {
      return variant.index();
    }
  std__variant_bool__OldEnum_ create_std__variant_bool__OldEnum_(bool value) {
    return std__variant_bool__OldEnum_(value);
  }
  std__variant_bool__OldEnum_ create_std__variant_bool__OldEnum_(OldEnum value) {
    return std__variant_bool__OldEnum_(value);
  }
  bool get_std__variant_bool__OldEnum__0(const std__variant_bool__OldEnum_& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  OldEnum get_std__variant_bool__OldEnum__1(const std__variant_bool__OldEnum_& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  std::optional<Person> create_std__optional_Person_(const Person& value) {
    return std::optional<Person>(value);
  }
  
  std__variant_Car__Person_::std__variant_Car__Person_(std::variant<Car, Person> variant): variant(variant) { }
  std__variant_Car__Person_::operator std::variant<Car, Person>() const {
    return variant;
  }
  size_t std__variant_Car__Person_::index() const {
      return variant.index();
    }
  std__variant_Car__Person_ create_std__variant_Car__Person_(const Car& value) {
    return std__variant_Car__Person_(value);
  }
  std__variant_Car__Person_ create_std__variant_Car__Person_(const Person& value) {
    return std__variant_Car__Person_(value);
  }
  Car get_std__variant_Car__Person__0(const std__variant_Car__Person_& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  Person get_std__variant_Car__Person__1(const std__variant_Car__Person_& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__::std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>> variant): variant(variant) { }
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__::operator std::variant<Person, std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>>() const {
    return variant;
  }
  size_t std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__::index() const {
      return variant.index();
    }
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__ create_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(const Person& value) {
    return std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(value);
  }
  std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__ create_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(const std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec>& value) {
    return std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__(value);
  }
  Person get_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec___0(const std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  std::shared_ptr<margelo::nitro::image::HybridTestObjectCppSpec> get_std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec___1(const std__variant_Person__std__shared_ptr_margelo__nitro__image__HybridTestObjectCppSpec__& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  std::tuple<double, double> create_std__tuple_double__double_(double arg0, double arg1) {
    return std::tuple<double, double> { arg0, arg1 };
  }
  
  std::tuple<double, double, double> create_std__tuple_double__double__double_(double arg0, double arg1, double arg2) {
    return std::tuple<double, double, double> { arg0, arg1, arg2 };
  }
  
  std__variant_std__tuple_double__double___std__tuple_double__double__double__::std__variant_std__tuple_double__double___std__tuple_double__double__double__(std::variant<std::tuple<double, double>, std::tuple<double, double, double>> variant): variant(variant) { }
  std__variant_std__tuple_double__double___std__tuple_double__double__double__::operator std::variant<std::tuple<double, double>, std::tuple<double, double, double>>() const {
    return variant;
  }
  size_t std__variant_std__tuple_double__double___std__tuple_double__double__double__::index() const {
      return variant.index();
    }
  std__variant_std__tuple_double__double___std__tuple_double__double__double__ create_std__variant_std__tuple_double__double___std__tuple_double__double__double__(const std::tuple<double, double>& value) {
    return std__variant_std__tuple_double__double___std__tuple_double__double__double__(value);
  }
  std__variant_std__tuple_double__double___std__tuple_double__double__double__ create_std__variant_std__tuple_double__double___std__tuple_double__double__double__(const std::tuple<double, double, double>& value) {
    return std__variant_std__tuple_double__double___std__tuple_double__double__double__(value);
  }
  std::tuple<double, double> get_std__variant_std__tuple_double__double___std__tuple_double__double__double___0(const std__variant_std__tuple_double__double___std__tuple_double__double__double__& variantWrapper) {
    return std::get<0>(variantWrapper.variant);
  }
  std::tuple<double, double, double> get_std__variant_std__tuple_double__double___std__tuple_double__double__double___1(const std__variant_std__tuple_double__double___std__tuple_double__double__double__& variantWrapper) {
    return std::get<1>(variantWrapper.variant);
  }
  
  std::tuple<double, std::string> create_std__tuple_double__std__string_(double arg0, const std::string& arg1) {
    return std::tuple<double, std::string> { arg0, arg1 };
  }
  
  std::tuple<double, std::string, bool> create_std__tuple_double__std__string__bool_(double arg0, const std::string& arg1, bool arg2) {
    return std::tuple<double, std::string, bool> { arg0, arg1, arg2 };
  }
  
  PromiseHolder<double> create_PromiseHolder_double_() {
    return PromiseHolder<double>();
  }
  
  Func_std__future_double__Wrapper::Func_std__future_double__Wrapper(const std::function<std::future<double>()>& func): function(func) {}
  Func_std__future_double__Wrapper::Func_std__future_double__Wrapper(std::function<std::future<double>()>&& func): function(std::move(func)) {}
  PromiseHolder<double> Func_std__future_double__Wrapper::call() const {
    auto __result = function();
    return []() -> PromiseHolder<double> { throw std::runtime_error("Promise<..> cannot be converted to Swift yet!"); }();
  }
  Func_std__future_double_ create_Func_std__future_double_(void* closureHolder, PromiseHolder<double>(*call)(void* /* closureHolder */), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_std__future_double_([sharedClosureHolder, call]() -> std::future<double> {
      auto __result = call(sharedClosureHolder.get());
      return __result.getFuture();
    });
  }
  std::shared_ptr<Func_std__future_double__Wrapper> share_Func_std__future_double_(const Func_std__future_double_& value) {
    return std::make_shared<Func_std__future_double__Wrapper>(value);
  }
  
  PromiseHolder<void> create_PromiseHolder_void_() {
    return PromiseHolder<void>();
  }
  
  Func_std__future_std__string__Wrapper::Func_std__future_std__string__Wrapper(const std::function<std::future<std::string>()>& func): function(func) {}
  Func_std__future_std__string__Wrapper::Func_std__future_std__string__Wrapper(std::function<std::future<std::string>()>&& func): function(std::move(func)) {}
  PromiseHolder<std::string> Func_std__future_std__string__Wrapper::call() const {
    auto __result = function();
    return []() -> PromiseHolder<std::string> { throw std::runtime_error("Promise<..> cannot be converted to Swift yet!"); }();
  }
  Func_std__future_std__string_ create_Func_std__future_std__string_(void* closureHolder, PromiseHolder<std::string>(*call)(void* /* closureHolder */), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_std__future_std__string_([sharedClosureHolder, call]() -> std::future<std::string> {
      auto __result = call(sharedClosureHolder.get());
      return __result.getFuture();
    });
  }
  std::shared_ptr<Func_std__future_std__string__Wrapper> share_Func_std__future_std__string_(const Func_std__future_std__string_& value) {
    return std::make_shared<Func_std__future_std__string__Wrapper>(value);
  }
  
  PromiseHolder<std::string> create_PromiseHolder_std__string_() {
    return PromiseHolder<std::string>();
  }
  
  std::optional<std::string> create_std__optional_std__string_(const std::string& value) {
    return std::optional<std::string>(value);
  }
  
  std::vector<Person> create_std__vector_Person_(size_t size) {
    std::vector<Person> vector;
    vector.reserve(size);
    return vector;
  }
  
  std::vector<Powertrain> create_std__vector_Powertrain_(size_t size) {
    std::vector<Powertrain> vector;
    vector.reserve(size);
    return vector;
  }
  
  Func_void_std__vector_Powertrain__Wrapper::Func_void_std__vector_Powertrain__Wrapper(const std::function<void(const std::vector<Powertrain>& /* array */)>& func): function(func) {}
  Func_void_std__vector_Powertrain__Wrapper::Func_void_std__vector_Powertrain__Wrapper(std::function<void(const std::vector<Powertrain>& /* array */)>&& func): function(std::move(func)) {}
  void Func_void_std__vector_Powertrain__Wrapper::call(std::vector<Powertrain> array) const {
    function(array);
  }
  Func_void_std__vector_Powertrain_ create_Func_void_std__vector_Powertrain_(void* closureHolder, void(*call)(void* /* closureHolder */, std::vector<Powertrain>), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__vector_Powertrain_([sharedClosureHolder, call](const std::vector<Powertrain>& array) -> void {
      call(sharedClosureHolder.get(), array);
    });
  }
  std::shared_ptr<Func_void_std__vector_Powertrain__Wrapper> share_Func_void_std__vector_Powertrain_(const Func_void_std__vector_Powertrain_& value) {
    return std::make_shared<Func_void_std__vector_Powertrain__Wrapper>(value);
  }
  
  std::optional<bool> create_std__optional_bool_(const bool& value) {
    return std::optional<bool>(value);
  }
  
  std::optional<Powertrain> create_std__optional_Powertrain_(const Powertrain& value) {
    return std::optional<Powertrain>(value);
  }
  
  PromiseHolder<int64_t> create_PromiseHolder_int64_t_() {
    return PromiseHolder<int64_t>();
  }
  
  Func_void_Wrapper::Func_void_Wrapper(const std::function<void()>& func): function(func) {}
  Func_void_Wrapper::Func_void_Wrapper(std::function<void()>&& func): function(std::move(func)) {}
  void Func_void_Wrapper::call() const {
    function();
  }
  Func_void create_Func_void(void* closureHolder, void(*call)(void* /* closureHolder */), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void([sharedClosureHolder, call]() -> void {
      call(sharedClosureHolder.get());
    });
  }
  std::shared_ptr<Func_void_Wrapper> share_Func_void(const Func_void& value) {
    return std::make_shared<Func_void_Wrapper>(value);
  }
  
  std::optional<double> create_std__optional_double_(const double& value) {
    return std::optional<double>(value);
  }
  
  Func_void_std__optional_double__Wrapper::Func_void_std__optional_double__Wrapper(const std::function<void(std::optional<double> /* maybe */)>& func): function(func) {}
  Func_void_std__optional_double__Wrapper::Func_void_std__optional_double__Wrapper(std::function<void(std::optional<double> /* maybe */)>&& func): function(std::move(func)) {}
  void Func_void_std__optional_double__Wrapper::call(std::optional<double> maybe) const {
    function(maybe);
  }
  Func_void_std__optional_double_ create_Func_void_std__optional_double_(void* closureHolder, void(*call)(void* /* closureHolder */, std::optional<double>), void(*destroy)(void*)) {
    std::shared_ptr<void> sharedClosureHolder(closureHolder, destroy);
    return Func_void_std__optional_double_([sharedClosureHolder, call](std::optional<double> maybe) -> void {
      call(sharedClosureHolder.get(), maybe);
    });
  }
  std::shared_ptr<Func_void_std__optional_double__Wrapper> share_Func_void_std__optional_double_(const Func_void_std__optional_double_& value) {
    return std::make_shared<Func_void_std__optional_double__Wrapper>(value);
  }

} // namespace margelo::nitro::image::bridge::swift
