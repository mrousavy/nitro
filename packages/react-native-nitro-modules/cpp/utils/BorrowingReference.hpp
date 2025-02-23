//
//  BorrowingReference.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 23.06.24.
//

#pragma once

#include "NitroDefines.hpp"
#include "NitroTypeInfo.hpp"
#include "OwningLock.hpp"
#include "ReferenceState.hpp"
#include "WeakReference.hpp"
#include <atomic>
#include <cstddef>
#include <mutex>

namespace margelo::nitro {

/**
 An `BorrowingReference<T>` is a smart-pointer that holds a strong reference to a pointer.
 You can have multiple `BorrowingReference<T>` instances point to the same pointer, as they internally keep a ref-count.
 As opposed to a `shared_ptr<T>`, an `BorrowingReference<T>` can also be imperatively manually deleted, even if there
 are multiple strong references still holding onto the pointer.
 This is useful in cases where the `BorrowingReference` might keep a reference alive, but an external value holder
 is actually responsible for truly deleting the underlying value - like a `jsi::Runtime` for a `jsi::Value`.

 An `BorrowingReference<T>` can be weakified, which gives the user a `WeakReference<T>`.
 A `WeakReference<T>` can be locked to get an `BorrowingReference<T>` again, assuming it has not been deleted yet.

 A `BorrowingReference<T>` can also be locked using `lock()`, which gives the user an `OwningLock<T>`.
 Only an `OwningLock<T>` guarantees safe access to the underlying value reference, as any external value holders
 that might try to delete the value will have to wait until the lock is freed again.
 */
template <typename T>
class BorrowingReference final {
public:
  BorrowingReference() : _value(nullptr), _state(nullptr) {}

  explicit BorrowingReference(T* value) : _value(value), _state(new ReferenceState()) {}

  BorrowingReference(const BorrowingReference& ref) : _value(ref._value), _state(ref._state) {
    if (_state != nullptr) {
      // increment ref count after copy
      _state->strongRefCount++;
    }
  }

  BorrowingReference(BorrowingReference&& ref) : _value(ref._value), _state(ref._state) {
    ref._value = nullptr;
    ref._state = nullptr;
  }

  BorrowingReference& operator=(const BorrowingReference& ref) {
    if (this == &ref)
      return *this;

    if (_state != nullptr) {
      // destroy previous pointer
      bool shouldDestroy = _state->decrementStrongRefCount();
      if (shouldDestroy) {
        forceDestroyValue();
      }
      maybeDestroyState();
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
  // WeakReference<T> -> BorrowingReference<T> Lock-constructor
  BorrowingReference(const WeakReference<T>& ref) : _value(ref._value), _state(ref._state) {
    _state->strongRefCount++;
  }

private:
  // BorrowingReference<C> -> BorrowingReference<T> Cast-constructor
  template <typename OldT>
  BorrowingReference(T* value, const BorrowingReference<OldT>& originalRef) : _value(value), _state(originalRef._state) {
    _state->strongRefCount++;
  }

  template <typename C>
  friend class BorrowingReference;

public:
  ~BorrowingReference() {
    if (_state == nullptr) {
      // we are just a dangling nullptr.
      return;
    }

    // decrement strong ref count on destroy
    bool shouldDestroy = _state->decrementStrongRefCount();
    if (shouldDestroy) {
      forceDestroyValue();
    }
    maybeDestroyState();
  }

public:
  /**
   Casts this `BorrowingReference<T>` to a `BorrowingReference<C>`.
   */
  template <typename C>
  BorrowingReference<C> as() {
    return BorrowingReference<C>(static_cast<C*>(_value), *this);
  }

public:
  /**
   Creates an `OwningLock<T>` for the given `BorrowingReference<T>` to guarantee safe
   safe access to `BorrowingReference<T>`.
   Other threads (e.g. the Hermes garbage collector) cannot delete the `BorrowingReference<T>`
   as long as the `OwningLock<T>` is still alive.
   */
  [[nodiscard]]
  OwningLock<T> lock() const {
    return OwningLock<T>(*this);
  }

  /**
   Get whether the `BorrowingReference<T>` is still pointing to a valid value, or not.
   */
  inline bool hasValue() const {
    return _value != nullptr && !_state->isDeleted;
  }

  /**
   Get a borrowing (or "weak") reference to this owning reference
   */
  [[nodiscard]]
  WeakReference<T> weak() const {
    return WeakReference(*this);
  }

  /**
   Delete and destroy the value this BorrowingReference is pointing to.
   This can even be called if there are still multiple strong references to the value.

   This will block as long as one or more `OwningLock<T>`s of this `BorrowingReference<T>` are still alive.
   */
  void destroy() {
    std::unique_lock lock(_state->mutex);

    forceDestroyValue();
  }

public:
  explicit inline operator bool() const {
    return hasValue();
  }

  inline T& operator*() const {
#ifdef NITRO_DEBUG
    if (!hasValue()) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<T>(true);
      throw std::runtime_error("Tried to dereference (*) nullptr BorrowingReference<" + typeName + ">!");
    }
#endif
    return *_value;
  }

  inline T* operator->() const {
#ifdef NITRO_DEBUG
    if (!hasValue()) [[unlikely]] {
      std::string typeName = TypeInfo::getFriendlyTypename<T>(true);
      throw std::runtime_error("Tried to dereference (->) nullptr BorrowingReference<" + typeName + ">!");
    }
#endif
    return _value;
  }

  inline bool operator==(T* other) const {
    return _value == other;
  }

  inline bool operator!=(T* other) const {
    return _value != other;
  }

  inline bool operator==(const BorrowingReference<T>& other) const {
    return _value == other._value;
  }

  inline bool operator!=(const BorrowingReference<T>& other) const {
    return _value != other._value;
  }

private:
  void maybeDestroyState() {
    if (_state->strongRefCount == 0 && _state->weakRefCount == 0) {
      // free the full memory if there are no more references at all
      delete _state;
      _state = nullptr;
      return;
    }
  }

  void forceDestroyValue() {
    if (_state->isDeleted) [[unlikely]] {
      // it has already been destroyed.
      return;
    }
    delete _value;
    _value = nullptr;
    _state->isDeleted = true;
  }

public:
  friend class WeakReference<T>;
  friend class OwningLock<T>;

private:
  T* _value;
  ReferenceState* _state;
};

} // namespace margelo::nitro

#include "WeakReference+Owning.hpp"
