import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import {
  createViewComponentShadowNodeFiles,
  getViewComponentNames,
} from '../ViewComponentShadowNode.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import { NitroConfig } from '../../config/NitroConfig.js'

export function createKotlinHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const javaNamespace = NitroConfig.getAndroidPackage('java/kotlin', 'views')
  const { manager } = getViewComponentNames(spec)

  const mmFile = `
${createFileMetadataString(`${manager}.kt`)}

package ${javaNamespace}

import android.view.View
import com.facebook.react.fabric.StateWrapperImpl
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext

class ${manager} extends SimpleViewManager<View> {
  override fun getName(): String {
    return "${spec.name}"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    throw Error("Not yet implemented!")
  }

  override fun updateState(view: View, props: ReactStylesDiffMap, stateWrapper: StateWrapper): Any {
    val stateWrapperImpl = stateWrapper as? StateWrapperImpl ?: throw Error("StateWrapper uses a different implementation!")
    // TODO: Get props from stateWrapperImpl and update them in HybridView

    return super.updateState(view, props, stateWrapper)
  }
}
  `

  return [
    ...cppFiles,
    {
      content: mmFile,
      language: 'kotlin',
      name: `${manager}.kt`,
      platform: 'android',
      subdirectory: [...javaNamespace.split('.')],
    },
  ]
}
