//
// Created by Marc Rousavy on 30.07.24.
//

#include "AnyMap.hpp"

namespace margelo::nitro {

bool AnyMap::contains(const std::string& key) {
    return _map.contains(key);
}

} // margelo::nitro
