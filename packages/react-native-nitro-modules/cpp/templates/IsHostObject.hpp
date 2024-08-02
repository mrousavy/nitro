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

// Returns whether the given type `T` is a `shared_ptr` to a `HostObject`
template <typename T>
struct is_shared_ptr_to_host_object : std::false_type {};

template <typename T>
struct is_shared_ptr_to_host_object<std::shared_ptr<T>> : std::is_base_of<jsi::HostObject, T> {};

template <typename T>
using is_shared_ptr_to_host_object_v = typename is_shared_ptr_to_host_object<std::remove_reference_t<T>>::value;

} // namespace margelo::nitro
