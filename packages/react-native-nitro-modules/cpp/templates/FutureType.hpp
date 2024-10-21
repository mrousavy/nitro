//
//  FutureType.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <future>
#include <type_traits>

namespace margelo::nitro {

// Gets the `T` in `std::future<T>`.
template <typename T, typename = void>
struct future_type {
  static_assert(!std::is_same_v<T, T>, "Type T is not an std::future!");
};
template <typename T>
struct future_type<std::future<T>> {
  using type = T;
};

template <typename T>
using future_type_v = typename future_type<std::remove_reference_t<T>>::type;

template <typename T>
using is_future_v = std::is_same_v<T, std::future<typename T::type>>;

} // namespace margelo::nitro
