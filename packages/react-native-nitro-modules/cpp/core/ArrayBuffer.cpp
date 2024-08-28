//
//  ArrayBuffer.cpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#include "ArrayBuffer.hpp"
#include "OwningReference.hpp"
#include <functional>
#include <jsi/jsi.h>
#include <thread>

namespace margelo::nitro {

using namespace facebook;

// 1. ArrayBuffer

std::shared_ptr<ArrayBuffer> ArrayBuffer::makeBuffer(uint8_t* data, size_t size, DeleteFn&& deleteFunc) {
  return std::make_shared<NativeArrayBuffer>(data, size, std::move(deleteFunc));
}

// 2. NativeArrayBuffer

NativeArrayBuffer::NativeArrayBuffer(uint8_t* data, size_t size, DeleteFn&& deleteFunc)
    : ArrayBuffer(), _data(data), _size(size), _deleteFunc(std::move(deleteFunc)) {}

NativeArrayBuffer::~NativeArrayBuffer() {
  if (_deleteFunc != nullptr) {
    _deleteFunc();
  }
}

uint8_t* NativeArrayBuffer::data() {
  return _data;
}

size_t NativeArrayBuffer::size() const {
  return _size;
}

bool NativeArrayBuffer::isOwner() const noexcept {
  return _deleteFunc != nullptr;
}

// 3. JSArrayBuffer

JSArrayBuffer::JSArrayBuffer(jsi::Runtime* runtime, OwningReference<jsi::ArrayBuffer> jsReference)
    : ArrayBuffer(), _runtime(runtime), _jsReference(jsReference), _initialThreadId(std::this_thread::get_id()) {}

JSArrayBuffer::~JSArrayBuffer() {}

uint8_t* JSArrayBuffer::data() {
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

size_t JSArrayBuffer::size() const {
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

bool JSArrayBuffer::isOwner() const noexcept {
  return false;
}

} // namespace margelo::nitro
