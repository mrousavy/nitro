//
//  NitroDefines.hpp
//  Nitro
//
//  Created by Marc Rousavy on 29.07.24.
//

#ifndef NitroDefines_h
#define NitroDefines_h

// Sets the version of the native Nitro core library
#define NITRO_VERSION "0.18.2"

// Sets whether to use debug or optimized production build flags
#ifdef DEBUG
#define NITRO_DEBUG
#endif
#ifdef NDEBUG
#undef NITRO_DEBUG
#endif
#ifdef ANDROID
#ifndef NDEBUG
#define NITRO_DEBUG
#endif
#endif

// Configures whether we should rethrow all errors in a catch-all block
// to let the parent error handler (e.g. in Hermes::Function::call) handle the error instead.
// This is due to a bug where on Android the RTTI of std::exception is not forward-propagated
// See: https://github.com/mrousavy/nitro/issues/382
#ifdef ANDROID
#define RETHROW_ALL_ERRORS
#endif

// Helper to find out if a C++ compiler attribute is available
#ifdef __has_attribute
#define _CXX_INTEROP_HAS_ATTRIBUTE(x) __has_attribute(x)
#else
#define _CXX_INTEROP_HAS_ATTRIBUTE(x) 0
#endif

#if _CXX_INTEROP_HAS_ATTRIBUTE(swift_attr)
// Rename Type for Swift
#define SWIFT_NAME(_name) __attribute__((swift_name(#_name)))
// Make Swift type private
#define SWIFT_PRIVATE __attribute__((swift_private))
// Make getter + setter a computed property
#define SWIFT_COMPUTED_PROPERTY __attribute__((swift_attr("import_computed_property")))
#else
#define SWIFT_NAME(_name)
#define SWIFT_PRIVATE
#define SWIFT_COMPUTED_PROPERTY
#endif

#if _CXX_INTEROP_HAS_ATTRIBUTE(enum_extensibility)
// Enum is marked as closed/not extensible
#define CLOSED_ENUM __attribute__((enum_extensibility(closed)))
#else
#define CLOSED_ENUM
#endif

#endif /* NitroDefines_h */
