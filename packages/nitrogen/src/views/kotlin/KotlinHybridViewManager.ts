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
  const autolinking = NitroConfig.getAutolinkedHybridObjects()
  const viewImplementation = autolinking[spec.name]?.kotlin
  if (viewImplementation == null) {
    throw new Error(
      `Cannot create Kotlin HybridView ViewManager for ${spec.name} - it is not autolinked in nitro.json!`
    )
  }

  const mmFile = `
${createFileMetadataString(`${manager}.kt`)}

package ${javaNamespace}

import android.view.View
import com.facebook.react.fabric.StateWrapperImpl
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import ${NitroConfig.getAndroidPackage('java/kotlin')}.*

/**
 * Represents the React Native \`ViewManager\` for the "${spec.name}" Nitro HybridView.
 */
class ${manager}: SimpleViewManager<View>() {
  private val views = hashMapOf<View, ${viewImplementation}>()

  override fun getName(): String {
    return "${spec.name}"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    val hybridView = ${viewImplementation}()
    val view = hybridView.view
    views[view] = hybridView
    return view
  }

  override fun onDropViewInstance(view: View) {
    super.onDropViewInstance(view)
    views.remove(view)
  }

  override fun updateState(view: View, props: ReactStylesDiffMap, stateWrapper: StateWrapper): Any? {
    val stateWrapperImpl = stateWrapper as? StateWrapperImpl ?: throw Error("StateWrapper uses a different implementation!")
    val hybridView = views[view] ?: throw Error("Couldn't find view $view in local views table!")
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
