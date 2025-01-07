///
/// ImageSize.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/JSIConverter.hpp>)
#include <NitroModules/JSIConverter.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
#if __has_include(<NitroModules/NitroDefines.hpp>)
#include <NitroModules/NitroDefines.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif





namespace margelo::nitro::image {

  /**
   * A struct which can be represented as a JavaScript object (ImageSize).
   */
  struct ImageSize {
  public:
    double width     SWIFT_PRIVATE;
    double height     SWIFT_PRIVATE;

  public:
    explicit ImageSize(double width, double height): width(width), height(height) {}
  };

} // namespace margelo::nitro::image

namespace margelo::nitro {

  using namespace margelo::nitro::image;

  // C++ ImageSize <> JS ImageSize (object)
  template <>
  struct JSIConverter<ImageSize> {
    static inline ImageSize fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return ImageSize(
        JSIConverter<double>::fromJSI(runtime, obj.getProperty(runtime, "width")),
        JSIConverter<double>::fromJSI(runtime, obj.getProperty(runtime, "height"))
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const ImageSize& arg) {
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "width", JSIConverter<double>::toJSI(runtime, arg.width));
      obj.setProperty(runtime, "height", JSIConverter<double>::toJSI(runtime, arg.height));
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object obj = value.getObject(runtime);
      if (!JSIConverter<double>::canConvert(runtime, obj.getProperty(runtime, "width"))) return false;
      if (!JSIConverter<double>::canConvert(runtime, obj.getProperty(runtime, "height"))) return false;
      return true;
    }
  };

} // namespace margelo::nitro
