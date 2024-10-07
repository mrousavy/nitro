package com.margelo.nitro

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NitroModulesPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == NitroModules.NAME) {
            NitroModules(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            val isTurboModule: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            moduleInfos[NitroModules.NAME] = ReactModuleInfo(
                NitroModules.NAME,
                NitroModules.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                hasConstants = false,
                isCxxModule = false,
                isTurboModule = isTurboModule
            )
            moduleInfos
        }
    }
}