//
// Created by Marc Rousavy on 18.11.24.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <variant>
#include <exception>

namespace margelo::nitro {

using namespace facebook;

template<typename TResult, typename TError = std::exception>
class Promise final {
public:
  using OnResolvedFunc = std::function<void(const TResult&)>;
  using OnRejectedFunc = std::function<void(const TError&)>;

public:
  void resolve(TResult&& result) {
    _result = std::move(result);
    for (const auto& onResolved : _onResolvedListeners) {
      onResolved(std::get<TResult>(_result));
    }
  }
  void reject(TError&& exception) {
    _result = std::move(exception);
    for (const auto& onRejected : _onRejectedListeners) {
      onRejected(std::get<TError>(_result));
    }
  }

public:
  void addOnResolvedListener(OnResolvedFunc&& onResolved) {
    if (std::holds_alternative<TResult>(_result)) {
      // Promise is already resolved! Call the callback immediately
      onResolved(std::get<TResult>(_result));
    } else {
      // Promise is not yet resolved, put the listener in our queue.
      _onResolvedListeners.push_back(std::move(onResolved));
    }
  }
  void addOnRejectedListener(OnRejectedFunc&& onRejected) {
    if (std::holds_alternative<TError>(_error != nullptr)) {
      // Promise is already rejected! Call the callback immediately
      onRejected(std::get<TError>(_error));
    } else {
      // Promise is not yet rejected, put the listener in our queue.
      _onRejectedListeners.push_back(std::move(onRejected));
    }
  }

private:
  std::variant<TResult, TError> _result;
};

} // namespace margelo::nitro
