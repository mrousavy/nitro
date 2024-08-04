//
//  BorrowingReference.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <type_traits>

namespace margelo::nitro {

// Returns whether the given type `T` is inside `Types...`
template <typename T, typename... Types>
struct is_in_pack : std::disjunction<std::is_same<T, Types>...> {};

template <typename T, typename... Types>
inline constexpr bool is_in_pack_v = is_in_pack<T, Types...>::value;

} // namespace margelo::nitro
