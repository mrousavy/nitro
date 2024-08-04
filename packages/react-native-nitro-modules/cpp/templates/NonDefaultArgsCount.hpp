//
//  NonDefaultArgsCount.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <type_traits>
#include <optional>

namespace margelo::nitro {

// Helper trait to check if a type is std::optional
template <typename T>
struct is_optional : std::false_type {};

template <typename T>
struct is_optional<std::optional<T>> : std::true_type {};

// Base case: No arguments, so the count is 0
template <typename... Args>
struct CountOptionals;

// Recursive case: Check the first type, then process the rest
template <typename First, typename... Rest>
struct CountOptionals<First, Rest...> {
    static constexpr size_t value = is_optional<First>::value + CountOptionals<Rest...>::value;
};

// Base case specialization for an empty pack
template <>
struct CountOptionals<> {
    static constexpr size_t value = 0;
};

template<typename... Args>
constexpr size_t count_trailing_optionals_v = CountOptionals<Args...>::value;

} // namespace margelo::nitro
