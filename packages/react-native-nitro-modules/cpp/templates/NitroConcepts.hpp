//
//  NitroConcepts.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 09.02.25.
//

#pragma once

#include <concepts>
#include <type_traits>

namespace margelo::nitro {

template <typename T>
concept SomeHybridObject = std::is_base_of_v<HybridObject, T>;

} // namespace margelo::nitro
