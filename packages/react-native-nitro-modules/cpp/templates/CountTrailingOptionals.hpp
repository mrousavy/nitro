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

// Helper template to check if a type is std::optional
template <typename T>
struct is_optional : std::false_type {};

template <typename T>
struct is_optional<std::optional<T>> : std::true_type {};

// Helper template to get the index of std::optional
template <int Index, typename... Args>
struct optional_index_helper;

template <int Index>
struct optional_index_helper<Index> {
    static constexpr int value = -1;
};

template <int Index, typename First, typename... Rest>
struct optional_index_helper<Index, First, Rest...> {
    static constexpr int value = is_optional<First>::value ? Index : optional_index_helper<Index + 1, Rest...>::value;
};

// Main template to get the first index of std::optional
template <typename... Args>
struct optional_index {
    static constexpr int value = optional_index_helper<0, Args...>::value;
};

// Helper template to count the number of std::optional types
template <typename... Args>
struct count_optionals;

template <>
struct count_optionals<> {
    static constexpr int value = 0;
};

template <typename First, typename... Rest>
struct count_optionals<First, Rest...> {
    static constexpr int value = is_optional<First>::value + count_optionals<Rest...>::value;
};


template <typename... Args>
struct trailing_optionals_count {
private:
  static constexpr int total_size = sizeof...(Args);
  static constexpr int total_optionals_count = count_optionals<Args...>::value;
  static constexpr int first_optional_index = optional_index<Args...>::value;
  
  // true if all of the optionals are at the end only (first index = start of optionals_count)
  static constexpr bool isTrailingOnly = total_size - first_optional_index == total_optionals_count;
  static constexpr bool hasOptionals = total_optionals_count > 0;
public:
  static constexpr int value = hasOptionals && isTrailingOnly ? total_optionals_count : 0;
};

template<typename... Args>
constexpr int trailing_optionals_count_v = trailing_optionals_count<Args...>::value;

} // namespace margelo::nitro
