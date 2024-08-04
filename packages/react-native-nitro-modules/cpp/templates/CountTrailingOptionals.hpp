//
//  CountTrailingOptionals.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <optional>
#include <type_traits>

namespace margelo::nitro {

template <typename T>
struct is_optional : std::false_type {};

template <typename T>
struct is_optional<std::optional<T>> : std::true_type {};

// Base case: No arguments, so the count is 0
template <typename... Args>
struct count_trailing_optionals;

// Specialization for empty parameter pack
template <>
struct count_trailing_optionals<> {
  static constexpr size_t value = 0;
};

// Recursive case: Check the last type, then process the rest
template <typename Last>
struct count_trailing_optionals<Last> {
  static constexpr size_t value = is_optional<Last>::value;
};

// Counts the number of consecutive trailing std::optionals a given type pack contains.
template <typename First, typename... Rest>
struct count_trailing_optionals<First, Rest...> {
private:
  static constexpr size_t rest_value = count_trailing_optionals<Rest...>::value;
  static constexpr bool rest_all_optionals = rest_value == sizeof...(Rest);

public:
  static constexpr size_t value = rest_all_optionals && is_optional<First>::value ? rest_value + 1 : rest_value;
};

template <typename... Args>
constexpr size_t count_trailing_optionals_v = count_trailing_optionals<Args...>::value;

} // namespace margelo::nitro
