///
/// NitroImage-Swift-Cxx-Umbrella.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

// Forward declarations of C++ defined types
// Forward declaration of `AnyMap` to properly resolve imports.
namespace NitroModules { class AnyMap; }
// Forward declaration of `ArrayBuffer` to properly resolve imports.
namespace NitroModules { class ArrayBuffer; }
// Forward declaration of `Car` to properly resolve imports.
namespace margelo::nitro::image { struct Car; }
// Forward declaration of `HybridBaseSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpec; }
// Forward declaration of `HybridChildSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridChildSpec; }
// Forward declaration of `HybridHybridViewSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridHybridViewSpec; }
// Forward declaration of `HybridImageFactorySpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridImageFactorySpec; }
// Forward declaration of `HybridImageSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridImageSpec; }
// Forward declaration of `HybridTestObjectSwiftKotlinSpec` to properly resolve imports.
namespace margelo::nitro::image { class HybridTestObjectSwiftKotlinSpec; }
// Forward declaration of `ImageFormat` to properly resolve imports.
namespace margelo::nitro::image { enum class ImageFormat; }
// Forward declaration of `ImageSize` to properly resolve imports.
namespace margelo::nitro::image { struct ImageSize; }
// Forward declaration of `JsStyleStruct` to properly resolve imports.
namespace margelo::nitro::image { struct JsStyleStruct; }
// Forward declaration of `MapWrapper` to properly resolve imports.
namespace margelo::nitro::image { struct MapWrapper; }
// Forward declaration of `OldEnum` to properly resolve imports.
namespace margelo::nitro::image { enum class OldEnum; }
// Forward declaration of `Person` to properly resolve imports.
namespace margelo::nitro::image { struct Person; }
// Forward declaration of `PixelFormat` to properly resolve imports.
namespace margelo::nitro::image { enum class PixelFormat; }
// Forward declaration of `Powertrain` to properly resolve imports.
namespace margelo::nitro::image { enum class Powertrain; }

// Include C++ defined types
#include "Car.hpp"
#include "HybridBaseSpec.hpp"
#include "HybridChildSpec.hpp"
#include "HybridHybridViewSpec.hpp"
#include "HybridImageFactorySpec.hpp"
#include "HybridImageSpec.hpp"
#include "HybridTestObjectSwiftKotlinSpec.hpp"
#include "ImageFormat.hpp"
#include "ImageSize.hpp"
#include "JsStyleStruct.hpp"
#include "MapWrapper.hpp"
#include "OldEnum.hpp"
#include "Person.hpp"
#include "PixelFormat.hpp"
#include "Powertrain.hpp"
#include <NitroModules/AnyMap.hpp>
#include <NitroModules/ArrayBuffer.hpp>
#include <NitroModules/Promise.hpp>
#include <NitroModules/Result.hpp>
#include <exception>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

// C++ helpers for Swift
#include "NitroImage-Swift-Cxx-Bridge.hpp"

// Common C++ types used in Swift
#include <NitroModules/ArrayBufferHolder.hpp>
#include <NitroModules/AnyMapHolder.hpp>
#include <NitroModules/HybridContext.hpp>
#include <NitroModules/RuntimeError.hpp>

// Forward declarations of Swift defined types
// Forward declaration of `HybridBaseSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridBaseSpec_cxx; }
// Forward declaration of `HybridChildSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridChildSpec_cxx; }
// Forward declaration of `HybridHybridViewSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridHybridViewSpec_cxx; }
// Forward declaration of `HybridImageFactorySpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridImageFactorySpec_cxx; }
// Forward declaration of `HybridImageSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridImageSpec_cxx; }
// Forward declaration of `HybridTestObjectSwiftKotlinSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridTestObjectSwiftKotlinSpec_cxx; }

// Include Swift defined types
#if __has_include("NitroImage-Swift.h")
// This header is generated by Xcode/Swift on every app build.
// If it cannot be found, make sure the Swift module's name (= podspec name) is actually "NitroImage".
#include "NitroImage-Swift.h"
// Same as above, but used when building with frameworks (`use_frameworks`)
#elif __has_include(<NitroImage/NitroImage-Swift.h>)
#include <NitroImage/NitroImage-Swift.h>
#else
#error NitroImage's autogenerated Swift header cannot be found! Make sure the Swift module's name (= podspec name) is actually "NitroImage", and try building the app first.
#endif
