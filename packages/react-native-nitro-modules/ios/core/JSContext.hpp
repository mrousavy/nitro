//
//  JSContext.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <memory>

namespace margelo {

template <typename T>
struct JSContext {
  std::weak_ptr<T> cppPart;
};

}
