//
//  SwiftTypes.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#if __has_include("NitroModules-Swift.h")

// Swift briding header is automatically generated
#include "NitroModules-Swift.h"

#else

namespace NitroModules {

template<typename T>
class ValueOrError;

class RuntimeError;

} // namespace NitroModules

#endif
