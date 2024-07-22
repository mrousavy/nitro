//
//  Callback.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 22.07.24.
//

#pragma once

#include <functional>
#include <string>

namespace margelo::nitro {

using TestOne = std::function<double(int)>;

using AnotherTwo = double(int);

} // namespace margelo::nitro
