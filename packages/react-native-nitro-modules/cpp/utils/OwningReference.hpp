//
//  OwningReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "BorrowingReference.hpp"
#include "NitroDefines.hpp"
#include "OwningLock.hpp"
#include "ReferenceState.hpp"
#include <atomic>
#include <cstddef>
#include <mutex>

namespace margelo::nitro {

/**
 An `OwningReference<T>` is a smart-pointer that holds a strong reference to a pointer.
 You can have multiple `OwningReference<T>` instances point to the same pointer, as they internally keep a ref-count.
 As opposed to a `shared_ptr<T>`, an `OwningReference<T>` can also be imperatively manually deleted, even if there
 are multiple strong references still holding onto the pointer.

 An `OwningReference<T>` can be weakified, which gives the user a `BorrowingReference<T>`.
 A `BorrowingReference<T>` can be locked to get an `OwningReference<T>` again, assuming it has not been deleted yet.
 */
template <typename T>
class OwningReference final {
public:
  using Pointee = T;

public:
  OwningReference() : _value(nullptr), _state(nullptr) {}

  explicit OwningReference(T* value) : _value(value), _state(new ReferenceState()) {}

  OwningReference(const OwningReference& ref) : _value(ref._value), _state(ref._state) {
    if (_state != nullptr) {
      // increment ref count after copy
      _state->strongRefCount++;
    }
  }

  OwningReference(OwningReference&& ref) : _value(ref._value), _state(ref._state) {
    ref._value = nullptr;
    ref._state = nullptr;
  }

  OwningReference& operator=(const OwningReference& ref) {
    if (this == &ref)
      return *this;

    if (_state != nullptr) {
      // destroy previous pointer
      _state->strongRefCount--;
      maybeDestroy();
    }

    _value = ref._value;
    _state = ref._state;
    if (_state != nullptr) {
      // increment new pointer
      _state->strongRefCount++;
    }

    return *this;
  }

private:
  // BorrowingReference<T> -> OwningReference<T> Lock-constructor
  OwningReference(const BorrowingReference<T>& ref) : _value(ref._value), _state(ref._state) {
    _state->strongRefCount++;
  }

private:
  // OwningReference<C> -> OwningReference<T> Cast-constructor
  template <typename OldT>
  OwningReference(T* value, const OwningReference<OldT>& originalRef) : _value(value), _state(originalRef._state) {
    _state->strongRefCount++;
  }

  template <typename C>
  friend class OwningReference;

public:
  ~OwningReference() {
    if (_state == nullptr) {
      // we are just a dangling nullptr.
      return;
    }

    // decrement strong ref count on destroy
    _state->strongRefCount--;
    maybeDestroy();
  }

public:
  /**
   Casts this `OwningReference<T>` to a `OwningReference<C>`.
   */
  template <typename C>
  OwningReference<C> as() {
    return OwningReference<C>(static_cast<C*>(_value), *this);
  }

public:
  /**
   Creates an `OwningLock<T>` for the given `OwningReference<T>` to guarantee safe
   safe access to `OwningReference<T>`.
   Other threads (e.g. the Hermes garbage collector) cannot delete the `OwningReference<T>`
   as long as the `OwningLock<T>` is still alive.
   */
  [[nodiscard]]
  OwningLock<T> lock() const {
    return OwningLock<T>(*this);
  }

  /**
   Get whether the `OwningReference<T>` is still pointing to a valid value, or not.
   */
  inline bool hasValue() const {
    return _value != nullptr && _state != nullptr && !_state->isDeleted;
  }

  /**
   Get a borrowing (or "weak") reference to this owning reference
   */
  [[nodiscard]]
  BorrowingReference<T> weak() const {
    return BorrowingReference(*this);
  }

  /**
   Delete and destroy the value this OwningReference is pointing to.
   This can even be called if there are still multiple strong references to the value.

   This will block as long as one or more `OwningLock<T>`s of this `OwningReference<T>` are still alive.
   */
  void destroy() {
    std::unique_lock lock(_state->mutex);

    forceDestroy();
  }

public:
  explicit inline operator bool() const {
    return hasValue();
  }

  inline T& operator*() const {
#ifdef NITRO_DEBUG
    if (!hasValue()) [[unlikely]] {
      throw std::runtime_error("Tried to dereference (*) nullptr OwningReference<T>!");
    }
#endif
    return *_value;
  }

  inline T* operator->() const {
#ifdef NITRO_DEBUG
    if (!hasValue()) [[unlikely]] {
      throw std::runtime_error("Tried to dereference (->) nullptr OwningReference<T>!");
    }
#endif
    return _value;
  }

  inline bool operator==(T* other) const {
    std::unique_lock lock(_state->mutex);

    if (_state == nullptr || _state->isDeleted) {
      return other == nullptr;
    } else {
      return other == _value;
    }
  }

  inline bool operator!=(T* other) const {
    return !(this == other);
  }

  inline bool operator==(const OwningReference<T>& other) const {
    return _value == other._value;
  }

  inline bool operator!=(const OwningReference<T>& other) const {
    return !(this == other);
  }

private:
  void maybeDestroy() {
    _state->mutex.lock();

    if (_state->strongRefCount == 0) {
      // after no strong references exist anymore
      forceDestroy();
    }

    if (_state->strongRefCount == 0 && _state->weakRefCount == 0) {
      // free the full memory if there are no more references at all
      _state->mutex.unlock();
      delete _state;
      return;
    }

    _state->mutex.unlock();
  }

  void forceDestroy() {
    if (_state->isDeleted) {
      // it has already been destroyed.
      return;
    }
    delete _value;
    _state->isDeleted = true;
  }

public:
  friend class BorrowingReference<T>;
  friend class OwningLock<T>;

private:
  T* _value;
  ReferenceState* _state;
};

} // namespace margelo::nitro

#include "BorrowingReference+Owning.hpp"
