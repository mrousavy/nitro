//
//  NitroError.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 04.11.25
//

#include "NitroError.hpp"
#include <exception>
#include <jsi/jsi.h>

namespace margelo::nitro {

jsi::Error NitroError::toJS(jsi::Runtime& runtime) const {
  // 1. Create a base JS Error with a message
  jsi::Object error = jsi::Error(runtime, _message).value();

  // 2. Set type and stacktrace
  error.setProperty(runtime, "type", _typename);
  error.setProperty(runtime, "stacktrace", _stacktrace);

  // 3. Box it back into a jsi::Error
  return jsi::Error(runtime, error);
}

} // namespace margelo::nitro
