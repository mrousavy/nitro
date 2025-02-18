//
//  NitroTypeInfo.hpp
//  Nitro
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include "NitroDefines.hpp"
#include <regex>
#include <sstream>
#include <string>
#include <type_traits>
#include <typeindex>

#if __has_include(<cxxabi.h>)
#include <cxxabi.h>
#endif

namespace margelo::nitro {

struct TypeInfo final {
public:
  TypeInfo() = delete;

  static inline std::string replaceRegex(const std::string& original, const std::string& pattern, const std::string& replacement) {
    std::regex re(pattern);
    return std::regex_replace(original, re, replacement);
  }

  static inline std::string demangleName(const std::string& typeName, bool removeNamespace = false) {
#ifdef NITRO_DEBUG
    // In debug, we demangle the name using Cxx ABI and prettify it.
    std::string name = typeName;
#if __has_include(<cxxabi.h>)
    int status = 0;
    char* demangled_name = abi::__cxa_demangle(name.c_str(), nullptr, nullptr, &status);
    if (demangled_name != nullptr) {
      name = demangled_name;
      std::free(demangled_name);
    }
#endif

#ifdef ANDROID
    // std::__ndk1 -> std::__1
    name = replaceRegex(name, R"(std::__ndk1)", "std::__1");
#endif

    // Make a few edge-cases nicer.
    name = replaceRegex(name, R"(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char> ?>)", "std::string");
    name = replaceRegex(name, R"(std::__1::vector<([^>]+), std::__1::allocator<\1>>)", "std::vector<$1>");
    name = replaceRegex(name, R"(std::__1::map<([^,]+), ([^>]+), std::__1::less<\1>, std::__1::allocator<std::__1::pair<const \1, \2>>>)",
                        "std::map<$1, $2>");
    name = replaceRegex(name, R"(std::__1::shared_ptr<([^>]+)>)", "std::shared_ptr<$1>");
    name = replaceRegex(name, R"(std::__1::unique_ptr<([^>]+), std::__1::default_delete<\1>>)", "std::unique_ptr<$1>");
    name = replaceRegex(
        name,
        R"(std::__1::unordered_map<([^,]+), ([^>]+), std::__1::hash<\1>, std::__1::equal_to<\1>, std::__1::allocator<std::__1::pair<const \1, \2>>>)",
        "std::unordered_map<$1, $2>");

    if (removeNamespace) [[unlikely]] {
      // replace `margelo::nitro::HybridObject` -> `HybridObject`
      size_t lastColon = name.rfind(':');
      if (lastColon != std::string::npos) {
        // Type contains a namespace - remove it
        name = name.substr(lastColon + 1);
      }
    }

    return name;
#else
    // In release, we don't do any of that. Just return the ugly name.
    return typeName;
#endif
  }

  /**
   * Get a friendly name of the given `type_info` (if possible, demangled)
   */
  static inline std::string getFriendlyTypename(const std::type_info& type, bool removeNamespace = false) {
    std::string typeName = type.name();
    return demangleName(typeName, removeNamespace);
  }

  /**
   * Get a friendly name of the given `type_index` (if possible, demangled)
   */
  static inline std::string getFriendlyTypename(const std::type_index& typeIndex, bool removeNamespace = false) {
    std::string typeName = typeIndex.name();
    return demangleName(typeName, removeNamespace);
  }

  /**
   * Get a friendly name of the type `T` (if possible, demangled)
   */
  template <typename T>
  static inline std::string getFriendlyTypename(bool removeNamespace = false) {
    return getFriendlyTypename(typeid(T), removeNamespace);
  }

  template <typename... Types>
  static inline std::string getFriendlyTypenames(bool removeNamespace = false) {
    std::ostringstream stream;
    ((stream << TypeInfo::getFriendlyTypename<Types>(removeNamespace) << ", "), ...);
    std::string string = stream.str();
    return string.substr(0, string.length() - 2);
  }

  /**
   * Get the name of the currently thrown exception
   */
  static inline std::string getCurrentExceptionName() {
#if __has_include(<cxxabi.h>)
    std::string name = __cxxabiv1::__cxa_current_exception_type()->name();
    return demangleName(name);
#else
    return "<unknown>";
#endif
  }
};

} // namespace margelo::nitro
