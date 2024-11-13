package com.nitroexample.exampleturbomodule

import com.facebook.react.bridge.ReactApplicationContext

class ExampleTurboModuleModule(reactContext: ReactApplicationContext) : NativeExampleTurboModuleSpec(reactContext) {
    override fun getName() = NAME

    override fun addNumbers(a: Double, b: Double): Double {
        return a + b
    }

    companion object {
        const val NAME = "ExampleTurboModule"
    }
}