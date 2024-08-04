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

template <typename T>
struct is_optional : std::false_type {};

template <typename T>
struct is_optional<std::optional<T>> : std::true_type {};

// Base case: No arguments, so the count is 0
template <typename... Args>
struct CountTrailingOptionals;

// Specialization for empty parameter pack
template <>
struct CountTrailingOptionals<> {
    static constexpr size_t value = 0;
};

// Recursive case: Check the last type, then process the rest
template <typename Last>
struct CountTrailingOptionals<Last> {
    static constexpr size_t value = is_optional<Last>::value;
};

template <typename First, typename... Rest>
struct CountTrailingOptionals<First, Rest...> {
private:
    static constexpr size_t rest_value = CountTrailingOptionals<Rest...>::value;
    static constexpr bool rest_all_optionals = rest_value == sizeof...(Rest);
public:
    static constexpr size_t value = rest_all_optionals && is_optional<First>::value ? rest_value + 1 : rest_value;
};

template<typename... Args>
constexpr size_t count_trailing_optionals_v = CountTrailingOptionals<Args...>::value;

} // namespace margelo::nitro
