//
//  PromiseType.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 09.12.24.
//

#pragma once

#include "Promise.hpp"
#include <type_traits>

namespace margelo::nitro {

// Gets the `T` in `Promise<T>`.
template <typename T>
struct promise_type {
  using type = void;
};
template <typename T>
struct promise_type<Promise<T>> {
  using type = T;
};
template <typename T>
struct promise_type<std::shared_ptr<Promise<T>>> {
  using type = T;
};

template <typename T>
using promise_type_v = typename promise_type<std::remove_reference_t<T>>::type;

} // namespace margelo::nitro
