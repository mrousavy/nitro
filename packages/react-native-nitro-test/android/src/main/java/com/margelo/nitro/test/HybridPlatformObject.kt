package com.margelo.nitro.test

import android.os.Build
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.modules.blob.BlobModule
import com.margelo.nitro.NitroModules

@Keep
@DoNotStrip
class HybridPlatformObject : HybridPlatformObjectSpec() {
  override fun getOSVersion(): String {
    return Build.VERSION.RELEASE
  }

  // Android CAN reach an RN native module from a HybridObject via
  // NitroModules.applicationContext — iOS has no equivalent.
  override fun getReactContextInfo(): String {
    val ctx = NitroModules.applicationContext
      ?: throw IllegalStateException("NitroModules.applicationContext == null")
    val blobModule = ctx.getNativeModule(BlobModule::class.java)
      ?: throw IllegalStateException("BlobModule not found")
    val blobId = blobModule.store(byteArrayOf(1, 2, 3))
    return "Android reached BlobModule, store([1,2,3]) -> $blobId"
  }
}
