//
//  IsSharedPtrTo.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 21.06.24.
//

#pragma once

#include <type_traits>

namespace margelo::nitro {

using namespace facebook;

// Returns whether the given type T is any specialization of Template.
template <template <typename...> class Template, typename T>
struct is_specialization_of : std::false_type {};

template <template <typename...> class Template, typename... Args>
struct is_specialization_of<Template, Template<Args...>> : std::true_type {};

template <template <typename...> class Template, typename T>
constexpr bool is_specialization_of_v = is_specialization_of<Template, T>::value;

} // namespace margelo::nitro
