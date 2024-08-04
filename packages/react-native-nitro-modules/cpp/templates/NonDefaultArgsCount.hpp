//
//  NonDefaultArgsCount.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// Helper structure to determine if a type has a default value
template <typename T>
struct has_default_value {
  template <typename U, U>
  struct check {};

  template <typename C>
  static std::true_type test(check<C, &C::default_value>*);

  template <typename>
  static std::false_type test(...);

  static constexpr bool value = decltype(test<T>(nullptr))::value;
};

// Counts the number of non-default/non-optional arguments a function has
template <typename... Args>
struct non_default_args_count;

template <>
struct non_default_args_count<> {
  static constexpr int value = 0;
};

// Recursive specialization
template <typename T, typename... Args>
struct non_default_args_count<T, Args...> {
  static constexpr int value = (has_default_value<T>::value ? 0 : 1) + non_default_args_count<Args...>::value;
};

template <typename... Args>
constexpr int non_default_args_count_v = non_default_args_count<Args...>::value;

} // namespace margelo::nitro
