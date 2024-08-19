//
//  JNativeFunction.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <functional>
#include <utility>
#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;


struct JFunction: public jni::JavaClass<JFunction> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/functions/Function1;";

    int call(double value) {
        static const auto method = javaClassLocal()->getMethod<jobject(jobject)>("call");
        jni::local_ref<jni::JObject> valueBoxed = jni::autobox(value);
        jni::local_ref<jni::JObject> returnBoxed = method(self(), valueBoxed.get());
        jni::local_ref<jni::JInteger> returnInt = jni::static_ref_cast<jni::JInteger>(returnBoxed);
        return returnInt->value();
    }
};

/**
 * Represents a C++ function that can be called from Java/Kotlin.
 */
template <typename R, typename... Args>
struct JNativeFunction {
public:
    using FuncType = std::function<R(Args...)>;

public:
    JNativeFunction(FuncType&& func): _func(std::move(func)) { }
    JNativeFunction(const FuncType& func): _func(func) { }
    virtual ~JNativeFunction() = default;
public:
    R call(Args&&... args) const {
      return _func(std::forward<Args>(args)...);
    }

private:
    FuncType _func;
};


template <typename R>
struct JNativeFunction0 : public jni::HybridClass<JNativeFunction0<R>>, public JNativeFunction<R> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/functions/NativeFunction0;";
    explicit JNativeFunction0(JNativeFunction<R>::FuncType&& func): JNativeFunction<R>(std::move(func)) { }

    static void registerNatives() {
      registerHybrid({
        makeNativeMethod("call", JNativeFunction<R>::call),
      });
    }
};
template <typename R, typename TArg1>
struct JNativeFunction1 : public jni::HybridClass<JNativeFunction1<R, TArg1>>, public JNativeFunction<R, TArg1> {
public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/functions/NativeFunction1;";
    explicit JNativeFunction1(JNativeFunction<R, TArg1>::FuncType&& func): JNativeFunction<R, TArg1>(std::move(func)) { }

    R call(TArg1&& arg) {
        return JNativeFunction<R, TArg1>::call(std::forward<TArg1>(arg));
    }

    static void registerNatives() {
      registerHybrid({
        makeNativeMethod("call", call),
      });
    }
};

} // namespace margelo::nitro
