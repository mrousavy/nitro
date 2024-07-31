//
//  TypeInfo.hpp
//  Pods
//
//  Created by Marc Rousavy on 17.07.24.
//

#pragma once

#include <string>
#include <type_traits>
#include <regex>

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
  
  static inline std::string replaceRegex(const std::string& original, const std::string& pattern, const std::string& replacement) {
      std::regex re(pattern);
      return std::regex_replace(original, re, replacement);
  }
  
  /**
   * Get a friendly name of the type `T` (if possible, demangled)
   */
  template <typename T>
  static inline std::string getFriendlyTypename() {
    std::string name = typeid(T).name();
#if __has_include(<cxxabi.h>)
    int status = 0;
    char* demangled_name = abi::__cxa_demangle(name.c_str(), NULL, NULL, &status);
    if (demangled_name != nullptr) {
      name = demangled_name;
      std::free(demangled_name);
    }
#endif
    
    // Make a few edge-cases nicer.
    name = replaceRegex(name, R"(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>)", "std::string");
    name = replaceRegex(name, R"(std::__1::vector<([^>]+), std::__1::allocator<\1>>)", "std::vector<$1>");
    name = replaceRegex(name, R"(std::__1::map<([^,]+), ([^>]+), std::__1::less<\1>, std::__1::allocator<std::__1::pair<const \1, \2>>>)", "std::map<$1, $2>");
    name = replaceRegex(name, R"(std::__1::shared_ptr<([^>]+)>)", "std::shared_ptr<$1>");
    name = replaceRegex(name, R"(std::__1::unique_ptr<([^>]+), std::__1::default_delete<\1>>)", "std::unique_ptr<$1>");
    name = replaceRegex(name, R"(std::__1::unordered_map<([^,]+), ([^>]+), std::__1::hash<\1>, std::__1::equal_to<\1>, std::__1::allocator<std::__1::pair<const \1, \2>>>)", "std::unordered_map<$1, $2>");
    name = replaceRegex(name, R"(std::__1::unordered_set<([^>]+), std::__1::hash<\1>, std::__1::equal_to<\1>, std::__1::allocator<\1>>)", "std::unordered_set<$1>");
    name = replaceRegex(name, R"(std::__1::list<([^>]+), std::__1::allocator<\1>>)", "std::list<$1>");

    return name;
  }
  
  template <typename... Types>
  static inline std::string getFriendlyTypenames() {
    std::ostringstream stream;
    ((stream << TypeInfo::getFriendlyTypename<Types>() << ", "), ...);
    std::string string = stream.str();
    return string.substr(0, string.length() - 2);
  }
};


} // namespace margelo::nitro
