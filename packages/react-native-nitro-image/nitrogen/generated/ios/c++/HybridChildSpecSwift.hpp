///
/// HybridChildSpecSwift.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include "HybridChildSpec.hpp"

// Forward declaration of `HybridChildSpec_cxx` to properly resolve imports.
namespace NitroImage { class HybridChildSpec_cxx; }

// Forward declaration of `HybridBaseSpecSwift` to properly resolve imports.
namespace margelo::nitro::image { class HybridBaseSpecSwift; }

#include "HybridBaseSpecSwift.hpp"

#include "NitroImage-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::image {

  /**
   * The C++ part of HybridChildSpec_cxx.swift.
   *
   * HybridChildSpecSwift (C++) accesses HybridChildSpec_cxx (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, HybridChildSpec_cxx can directly inherit from the C++ class HybridChildSpec
   * to simplify the whole structure and memory management.
   */
  class HybridChildSpecSwift: public virtual HybridChildSpec, public virtual HybridBaseSpecSwift {
  public:
    // Constructor from a Swift instance
    explicit HybridChildSpecSwift(const NitroImage::HybridChildSpec_cxx& swiftPart):
      HybridObject(HybridChildSpec::TAG),
      HybridBaseSpecSwift(swiftPart),
      _swiftPart(swiftPart) { }

  public:
    // Get the Swift part
    inline NitroImage::HybridChildSpec_cxx& getSwiftPart() noexcept {
      return _swiftPart;
    }

  public:
    // Get memory pressure
    inline size_t getExternalMemorySize() noexcept override {
      return _swiftPart.getMemorySize();
    }

  public:
    // Properties
    inline double getChildValue() noexcept override {
      return _swiftPart.getChildValue();
    }

  public:
    // Methods
    

  private:
    NitroImage::HybridChildSpec_cxx _swiftPart;
  };

} // namespace margelo::nitro::image
