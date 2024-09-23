//
//  JVariant.hpp
//  react-native-nitro
//
//  Created by Marc Rousavy on 14.07.24.
//

#pragma once

#include <fbjni/fbjni.h>

namespace margelo::nitro {

using namespace facebook;

template <typename A, typename B>
class JVariant2 : public jni::JavaClass<JVariant2<A, B>> {
public:
    static constexpr auto kJavaDescriptor = "Lcom/example/Variant2;"; // Adjust the descriptor to your package.
};
template <typename A>
class JVariant2_First : public JVariant2<A, jobject> {
public:
    static constexpr auto kJavaDescriptor = "Lcom/example/Variant2$First;";

    static jni::local_ref<JVariant2_First<A>> create(A value) {
        return JVariant2_First<A>::newInstance(value);
    }

    A getValue() {
        static const auto method = JVariant2_First<A>::javaClassStatic()->getMethod<A()>("getValue");
        return method(this->self());
    }
};
template <typename B>
class JVariant2_Second : public JVariant2<jobject, B> {
public:
    static constexpr auto kJavaDescriptor = "Lcom/example/Variant2$Second;";

    static jni::local_ref<JVariant2_Second<B>> create(B value) {
        return JVariant2_Second<B>::newInstance(value);
    }

    B getValue() {
        static const auto method = JVariant2_Second<B>::javaClassStatic()->getMethod<B()>("getValue");
        return method(this->self());
    }
};

template <typename T>
T getAs(jobject variant) {
    static const auto method = jni::findClassStatic("com/example/Variant2")
                                   ->getMethod<jni::local_ref<jobject>()>("getAs");
    auto result = method(variant);
    return jni::dynamic_ref_cast<T>(result);
}

} // namespace margelo::nitro
