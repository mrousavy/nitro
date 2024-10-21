//
//  IsFuture.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <future>
#include <type_traits>

namespace margelo::nitro {

// Gets whether type T is a future
template <typename T>
struct is_future : std::false_type {};
template <typename T>
struct is_future<std::future<T>> : std::true_type {};

template <typename T>
inline constexpr bool is_future_v = is_future<T>::value;

} // namespace margelo::nitro
