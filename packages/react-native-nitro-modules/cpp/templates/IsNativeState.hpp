//
//  BorrowingReference.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <jsi/jsi.h>
#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// Returns whether the given type `T` is a `shared_ptr` to a `NativeStaet`
template <typename T>
struct is_shared_ptr_to_native_state : std::false_type {};

template <typename T>
struct is_shared_ptr_to_native_state<std::shared_ptr<T>> : std::is_base_of<jsi::NativeState, T> {};

template <typename T>
using is_shared_ptr_to_native_state_v = typename is_shared_ptr_to_native_state<std::remove_reference_t<T>>::value;

} // namespace margelo::nitro
