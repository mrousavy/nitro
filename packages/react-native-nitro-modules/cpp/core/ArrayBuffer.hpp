//
//  ArrayBuffer.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <functional>
#include <jsi/jsi.h>
#include <thread>
#include "OwningReference.hpp"

namespace margelo::nitro {

using namespace facebook;

using DeleteFn = std::function<void(uint8_t*)>;

static DeleteFn defaultDeleteFn = [](uint8_t* buffer) { delete[] buffer; };

/**
 * Represents a raw byte buffer that can be read from-, and
 * written to- from both JavaScript and C++.
 * `ArrayBuffer` is not thread-safe and does not lock multi-thread access.
 *
 * `ArrayBuffer` can either be a `JSArrayBuffer`, or a `NativeArrayBuffer`.
 * - `NativeArrayBuffer`: Created from native (C++), and can either own the memory (`isOwner()`), or borrow it.
 * - `JSArrayBuffer`: Received from JS, and will only be alive for as long as the JS Runtime is actually alive.
 *
 * Also, an `ArrayBuffer` can either own it's memory, or just borrow it's memory.
 * - Owning = the `ArrayBuffer`'s `data()` is alive as long as the `ArrayBuffer` is alive.
 *   When this `ArrayBuffer` gets deleted, it will free the memory.
 * - Borrowed = the `ArrayBuffer`'s `data()` might be deleted at any point from an external source (e.g. the JS garbage collector).
 *   When this `ArrayBuffer` gets deleted, the memory will not be freed explicitly, as someone else owns it.
 */
class ArrayBuffer : public jsi::MutableBuffer {
public:
  ArrayBuffer() = default;
  ArrayBuffer(const ArrayBuffer&) = delete;
  ArrayBuffer(ArrayBuffer&&) = delete;
  virtual ~ArrayBuffer();
  
public:
  /**
   * Returns whether this `ArrayBuffer` is actually owning the data,
   * or if it is just borrowed from an external source (either a native
   * memory that we didn't allocate, or from JS - which can be deleted at any point).
   */
  virtual bool isOwner() const noexcept = 0;
};

/**
 * Represents an `ArrayBuffer` that is allocated on the native (C++) side.
 * It can either be "owning" or "borrowing".
 *
 * - Owning = the `ArrayBuffer`'s `data()` is alive as long as the `ArrayBuffer` is alive.
 *   When this `ArrayBuffer` gets deleted, it will free the memory.
 * - Borrowed = the `ArrayBuffer`'s `data()` might be deleted at any point from an external source (e.g. the JS garbage collector).
 *   When this `ArrayBuffer` gets deleted, the memory will not be freed explicitly, as someone else owns it.
 *
 * It is safe to access `data()` and `size()` from any Thread, but there are no synchronization/mutexes implemented by default.
 */
class NativeArrayBuffer: public ArrayBuffer {
public:
  /**
   * Create a new **owning** `ArrayBuffer`.
   * The `ArrayBuffer` can be kept in memory, as C++ owns the data
   * and will only delete it once this `ArrayBuffer` gets deleted
   */
  NativeArrayBuffer(uint8_t* data, size_t size, DeleteFn&& deleteFunc) : ArrayBuffer(), _data(data), _size(size), _deleteFunc(std::move(deleteFunc)) {}
  /**
   * Create a new `ArrayBuffer`.
   * If `destroyOnDeletion` is `true`, the `ArrayBuffer` is **owning**, otherwise it is **non-owning**.
   * The `ArrayBuffer` can only be safely kept in memory if it is owning (`isOwning()`).
   */
  NativeArrayBuffer(uint8_t* data, size_t size, bool destroyOnDeletion) : ArrayBuffer(), _data(data), _size(size) {
    _deleteFunc = destroyOnDeletion ? defaultDeleteFn : nullptr;
  }

  ~NativeArrayBuffer() {
    if (_deleteFunc != nullptr) {
      _deleteFunc(_data);
    }
  }

  uint8_t* data() override {
    return _data;
  }

  size_t size() const override {
    return _size;
  }

  bool isOwner() const noexcept override {
    return _deleteFunc != nullptr;
  }

private:
  uint8_t* _data;
  size_t _size;
  DeleteFn _deleteFunc;
};

/**
 * Represents a JS-based `ArrayBuffer`.
 *
 * While it's underlying data might have been allocated on the native side (`NativeArrayBuffer`),
 * we only have a JS reference to the `ArrayBuffer` object so it is considered a "borrowed"-resource.
 *
 * `data()` and `size()` can only be accessed synchronously on the JS Runtime Thread.
 * If you want to access it elsewhere, copy the buffer first.
 *
 * If the JS ArrayBuffer (or it's JS Runtime) have already been deleted, `data()` returns `nullptr`.
 */
class JSArrayBuffer: public ArrayBuffer {
public:
  explicit JSArrayBuffer(jsi::Runtime* runtime,
                         OwningReference<jsi::ArrayBuffer> jsReference):
  ArrayBuffer(),
  _runtime(runtime),
  _jsReference(jsReference),
  _initialThreadId(std::this_thread::get_id())
  {}
  
public:
  /**
   * Gets the data this `ArrayBuffer` points to, or `nullptr` if it has already been deleted.
   */
  uint8_t* data() override {
    if (_initialThreadId != std::this_thread::get_id()) [[unlikely]] {
      throw std::runtime_error("`data()` can only be accessed synchronously on the JS Thread! "
                               "If you want to access it elsewhere, copy it first.");
    }
    
    OwningLock<jsi::ArrayBuffer> lock = _jsReference.lock();
    if (!_jsReference) [[unlikely]] {
      // JS Part has been deleted - data is now nullptr.
      return nullptr;
    }
    // JS Part is still alive - we can assume that the jsi::Runtime is safe to access here too.
    return _jsReference->data(*_runtime);
  }
  
  /**
   * Gets the size of the data this `ArrayBuffer` points to, or `0` if it has already been deleted.
   */
  size_t size() const override {
    if (_initialThreadId != std::this_thread::get_id()) [[unlikely]] {
      throw std::runtime_error("`size()` can only be accessed synchronously on the JS Thread! "
                               "If you want to access it elsewhere, copy it first.");
    }
    
    OwningLock<jsi::ArrayBuffer> lock = _jsReference.lock();
    if (!_jsReference) [[unlikely]] {
      // JS Part has been deleted - size is now 0.
      return 0;
    }
    // JS Part is still alive - we can assume that the jsi::Runtime is safe to access here too.
    return _jsReference->size(*_runtime);
  }
  
  bool isOwner() const noexcept override {
    return false;
  }
  
private:
  jsi::Runtime* _runtime;
  OwningReference<jsi::ArrayBuffer> _jsReference;
  std::thread::id _initialThreadId;
};

} // namespace margelo::nitro
