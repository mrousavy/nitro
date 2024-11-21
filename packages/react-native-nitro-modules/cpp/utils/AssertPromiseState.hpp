//
//  AssertPromiseState.hpp
//  NitroModules
//
//  Created by Marc Rousavy on 20.11.24.
//

#pragma once

namespace margelo::nitro {
template <typename TResult, typename TError>
class Promise;
} // namespace margelo::nitro

#include "Promise.hpp"
#include "TypeInfo.hpp"
#include <exception>
#include <string>

namespace margelo::nitro {

enum PromiseTask { WANTS_TO_RESOLVE, WANTS_TO_REJECT };

template <typename TResult, typename TError>
void assertPromiseState(Promise<TResult, TError>& promise, PromiseTask task) {
  if (!promise.isPending()) [[unlikely]] {
    std::string taskString = task == WANTS_TO_RESOLVE ? "resolve" : "reject";
    std::string state = promise.isResolved() ? "resolved" : "rejected";
    throw std::runtime_error("Cannot " + taskString + " Promise<" + TypeInfo::getFriendlyTypename<TResult>() + "> - it is already " +
                             state + "!");
  }
}

} // namespace margelo::nitro
