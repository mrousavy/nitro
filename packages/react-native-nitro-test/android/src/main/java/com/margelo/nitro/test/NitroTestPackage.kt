package com.margelo.nitro.test

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.test.views.HybridTestViewManager
import com.margelo.nitro.test.views.HybridViewWithChildrenManager

class NitroTestPackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider { HashMap() }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        val viewManagers = ArrayList<ViewManager<*, *>>()
        viewManagers.add(HybridTestViewManager())
        viewManagers.add(HybridViewWithChildrenManager())
        return viewManagers
    }

    companion object {
        init {
            NitroTestOnLoad.initializeNative()
        }
    }
}