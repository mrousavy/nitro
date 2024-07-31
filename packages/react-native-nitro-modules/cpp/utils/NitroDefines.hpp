//
//  NitroDefines.hpp
//  Pods
//
//  Created by Marc Rousavy on 29.07.24.
//

#ifndef NitroDefines_h
#define NitroDefines_h

// Helper to find out if a C++ compiler attribute is available
#ifdef __has_attribute
#define _CXX_INTEROP_HAS_ATTRIBUTE(x) __has_attribute(x)
#else
#define _CXX_INTEROP_HAS_ATTRIBUTE(x) 0
#endif

#if _CXX_INTEROP_HAS_ATTRIBUTE(swift_attr)
// Rename Type for Swift
#define SWIFT_NAME(_name) __attribute__((swift_name(#_name)))
#else
#define SWIFT_NAME(_name)
#endif

#if _CXX_INTEROP_HAS_ATTRIBUTE(enum_extensibility)
// Enum is marked as closed/not extensible
#define CLOSED_ENUM __attribute__((enum_extensibility(closed)))
#else
#define CLOSED_ENUM
#endif

#endif /* NitroDefines_h */
