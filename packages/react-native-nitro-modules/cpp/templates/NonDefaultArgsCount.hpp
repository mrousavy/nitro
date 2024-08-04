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

// Forward declaration
template<typename... Args>
struct count_trailing_optionals;

// Base case: No more arguments to check, so count is zero
template<>
struct count_trailing_optionals<> {
    static constexpr size_t value = 0;
};

// Recursive case: If the last argument is an std::optional, check the rest
template<typename T, typename... Rest>
struct count_trailing_optionals<std::optional<T>, Rest...> {
    static constexpr size_t value = 1 + count_trailing_optionals<Rest...>::value;
};

// Recursive case: If the last argument is not an std::optional, count is zero
template<typename Last, typename... Rest>
struct count_trailing_optionals<Last, Rest...> {
    static constexpr size_t value = 0;
};

// Helper variable template
template<typename... Args>
constexpr size_t count_trailing_optionals_v = count_trailing_optionals<Args...>::value;

} // namespace margelo::nitro
