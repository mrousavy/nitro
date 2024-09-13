//
// Created by Marc Rousavy on 21.02.24.
//

#pragma once

// Forward declare a few of the common types that might have cyclic includes.
namespace margelo::nitro {
template <typename T, typename Enable>
struct JSIConverter;
} // namespace margelo::nitro

#include <jsi/jsi.h>
#include <type_traits>
#include <variant>
#include <fbjni/fbjni.h>
#include "JSIConverter.hpp"

namespace margelo::nitro {

using namespace facebook;

// number? <> Double?
    template<>
    struct JSIConverter<jni::JDouble> final {
        static inline jni::local_ref<jni::JDouble> fromJSI(jsi::Runtime&, const jsi::Value& arg) {
            if (arg.isUndefined() || arg.isNull()) {
                return nullptr;
            } else {
                return jni::JDouble::valueOf(arg.asNumber());
            }
        }
        static inline jsi::Value toJSI(jsi::Runtime&, const jni::alias_ref<jni::JDouble>& arg) {
            if (arg == nullptr) {
                return jsi::Value::undefined();
            } else {
                return jsi::Value(arg->value());
            }
        }
        static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
            return value.isUndefined() || value.isNull() || value.isNumber();
        }
    };

// boolean? <> Bool?
    template<>
    struct JSIConverter<jni::JBoolean> final {
        static inline jni::local_ref<jni::JBoolean> fromJSI(jsi::Runtime&, const jsi::Value& arg) {
            if (arg.isUndefined() || arg.isNull()) {
                return nullptr;
            } else {
                return jni::JBoolean::valueOf(arg.asBool());
            }
        }
        static inline jsi::Value toJSI(jsi::Runtime&, const jni::alias_ref<jni::JBoolean>& arg) {
            if (arg == nullptr) {
                return jsi::Value::undefined();
            } else {
                return jsi::Value(arg->value());
            }
        }
        static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
            return value.isUndefined() || value.isNull() || value.isBool();
        }
    };

// bigint? <> Long?
    template<>
    struct JSIConverter<jni::JLong> final {
        static inline jni::local_ref<jni::JLong> fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
            if (arg.isUndefined() || arg.isNull()) {
                return nullptr;
            } else {
                return jni::JLong::valueOf(arg.asBigInt(runtime).asInt64(runtime));
            }
        }
        static inline jsi::Value toJSI(jsi::Runtime& runtime, const jni::alias_ref<jni::JLong>& arg) {
            if (arg == nullptr) {
                return jsi::Value::undefined();
            } else {
                return jsi::BigInt::fromInt64(runtime, arg->value());
            }
        }
        static inline bool canConvert(jsi::Runtime&, const jsi::Value& value) {
            return value.isUndefined() || value.isNull() || value.isBigInt();
        }
    };

} // namespace margelo::nitro
