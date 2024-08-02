//
//  DoesClassExist.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <type_traits>

namespace margelo::nitro {

// By default, it is false (class does not exist)
template <typename T, typename = std::void_t<>>
struct does_class_exist : std::false_type {};

// If sizeof(T) can be a type (number), the type exists - so it is true
template <typename T>
struct does_class_exist<T, std::void_t<decltype(sizeof(T))>> : std::true_type {};

// Direct value accessor for does_class_exist
template <typename T>
inline constexpr bool does_class_exist_v = does_class_exist<T>::value;

} // namespace margelo::nitro
