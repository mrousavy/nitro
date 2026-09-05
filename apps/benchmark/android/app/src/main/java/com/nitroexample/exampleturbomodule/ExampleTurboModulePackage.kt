package com.nitroexample.exampleturbomodule

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ExampleTurboModulePackage: BaseReactPackage() {
    override fun getModule(name: String, context: ReactApplicationContext): NativeModule? {
        if (name == ExampleTurboModuleModule.NAME) {
            return ExampleTurboModuleModule(context)
        } else {
            return null
        }
    }
    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            ExampleTurboModuleModule.NAME to ReactModuleInfo(
                ExampleTurboModuleModule.NAME,
                ExampleTurboModuleModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                true, // hasConstants
                false, // isCxxModule
                true // isTurboModule
            )
        )
    }
}
