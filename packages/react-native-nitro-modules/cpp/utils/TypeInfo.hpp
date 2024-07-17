//
//  TypeInfo.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <string>
#include <type_traits>

#if __has_include(<cxxabi.h>)
#include <cxxabi.h>
#endif

namespace margelo::nitro {

struct TypeInfo final {
public:
  TypeInfo() = delete;
  
  /**
   * Get the name of the currently thrown exception
   */
  static inline const char* getCurrentExceptionName() {
#if __has_include(<cxxabi.h>)
    return __cxxabiv1::__cxa_current_exception_type()->name();
#else
    return "<unknown>";
#endif
  }
  
  /**
   * Get a friendly name of the type `T` (if possible, demangled)
   */
  template <typename T>
  static inline const char* getFriendlyTypename() {
    const char* name = typeid(T).name();
#if __has_include(<cxxabi.h>)
    int status = 0;
    char* demangled_name = abi::__cxa_demangle(name, NULL, NULL, &status);
    if (status == 0) {
      name = demangled_name;
      std::free(demangled_name);
    }
#endif
    return name;
  }
  
};


} // namespace margelo::nitro
