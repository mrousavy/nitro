import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import {
  createViewComponentShadowNodeFiles,
  getViewComponentNames,
} from '../CppHybridViewComponent.js'
import {
  createFileMetadataString,
  escapeCppName,
} from '../../syntax/helpers.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { addJNINativeRegistration } from '../../syntax/kotlin/JNINativeRegistrations.js'
import { indent } from '../../utils.js'

export function createKotlinHybridViewManager(
  spec: HybridObjectSpec
): SourceFile[] {
  const cppFiles = createViewComponentShadowNodeFiles(spec)
  const javaSubNamespace = spec.config.getAndroidPackage('java/kotlin', 'views')
  const javaNamespace = spec.config.getAndroidPackage('java/kotlin')
  const cxxNamespace = spec.config.getCxxNamespace('c++', 'views')
  const { JHybridTSpec, HybridTSpec } = getHybridObjectName(spec.name)
  const {
    manager,
    stateClassName,
    component,
    propsClassName,
    descriptorClassName,
  } = getViewComponentNames(spec)
  const stateUpdaterName = `${stateClassName}Updater`
  const autolinking = spec.config.getAutolinkedHybridObjects()
  const viewImplementation = autolinking[spec.name]?.kotlin
  if (viewImplementation == null) {
    throw new Error(
      `Cannot create Kotlin HybridView ViewManager for ${spec.name} - it is not autolinked in nitro.json!`
    )
  }

  const viewManagerCode = `
${createFileMetadataString(`${manager}.kt`)}

package ${javaSubNamespace}

import android.view.View
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.R.id.associated_hybrid_view_tag
import com.margelo.nitro.views.RecyclableView
import ${javaNamespace}.*

/**
 * Represents the React Native \`ViewManager\` for the "${spec.name}" Nitro HybridView.
 */
public class ${manager}: SimpleViewManager<View>() {
  init {
    if (RecyclableView::class.java.isAssignableFrom(${viewImplementation}::class.java)) {
      // Enable view recycling
      super.setupViewRecycling()
    }
  }

  override fun getName(): String {
    return "${spec.name}"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    val hybridView = ${viewImplementation}(reactContext)
    val view = hybridView.view
    view.setTag(associated_hybrid_view_tag, hybridView)
    return view
  }

  override fun updateState(view: View, props: ReactStylesDiffMap, stateWrapper: StateWrapper): Any? {
    val hybridView = view.getTag(associated_hybrid_view_tag) as? ${viewImplementation}
      ?: throw Error("Couldn't find view $view in local views table!")

    // 1. Update each prop individually
    hybridView.beforeUpdate()
    ${stateUpdaterName}.updateViewProps(hybridView, stateWrapper)
    hybridView.afterUpdate()

    // 2. Continue in base View props
    return super.updateState(view, props, stateWrapper)
  }

  protected override fun prepareToRecycleView(reactContext: ThemedReactContext, view: View): View? {
    super.prepareToRecycleView(reactContext, view)
    val hybridView = view.getTag(associated_hybrid_view_tag) as? ${viewImplementation}
      ?: return null

    @Suppress("USELESS_IS_CHECK")
    if (hybridView is RecyclableView) {
      // Recycle in it's implementation
      hybridView.prepareForRecycle()

      // Maybe update the view if it changed
      return hybridView.view
    } else {
      return null
    }
  }
}
  `.trim()

  const updaterKotlinCode = `
${createFileMetadataString(`${stateUpdaterName}.kt`)}

package ${javaSubNamespace}

import com.facebook.react.uimanager.StateWrapper
import ${javaNamespace}.*

internal class ${stateUpdaterName} {
  companion object {
    /**
     * Updates the props for [view] through C++.
     * The [state] prop is expected to contain [view]'s props as wrapped Fabric state.
     */
    @Suppress("KotlinJniMissingFunction")
    @JvmStatic
    external fun updateViewProps(view: ${HybridTSpec}, state: StateWrapper)
  }
}
  `.trim()

  const updaterJniDescriptor = spec.config.getAndroidPackage(
    'c++/jni',
    'views',
    stateUpdaterName
  )
  const updaterJniHeaderCode = `
${createFileMetadataString(`J${stateUpdaterName}.hpp`)}

#pragma once

#ifndef RN_SERIALIZABLE_STATE
#error ${spec.config.getAndroidCxxLibName()} was compiled without the 'RN_SERIALIZABLE_STATE' flag. This flag is required for Nitro Views - set it in your CMakeLists!
#endif

#include <fbjni/fbjni.h>
#include <react/fabric/CoreComponentsRegistry.h>
#include <react/fabric/StateWrapperImpl.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <NitroModules/NitroDefines.hpp>
#include <NitroModules/JStateWrapper.hpp>
#include "${JHybridTSpec}.hpp"
#include "views/${component}.hpp"

namespace ${cxxNamespace} {

using namespace facebook;

class J${stateUpdaterName} final: public jni::JavaClass<J${stateUpdaterName}> {
public:
  static constexpr auto kJavaDescriptor = "L${updaterJniDescriptor};";

public:
  static void updateViewProps(jni::alias_ref<jni::JClass> /* class */,
                              jni::alias_ref<${JHybridTSpec}::javaobject> view,
                              jni::alias_ref<JStateWrapper::javaobject> stateWrapperInterface);

public:
  static void registerNatives() {
    // Register JNI calls
    javaClassStatic()->registerNatives({
      makeNativeMethod("updateViewProps", J${stateUpdaterName}::updateViewProps),
    });
    // Register React Native view component descriptor
    auto provider = react::concreteComponentDescriptorProvider<${descriptorClassName}>();
    auto providerRegistry = react::CoreComponentsRegistry::sharedProviderRegistry();
    providerRegistry->add(provider);
  }
};

} // namespace ${cxxNamespace}
  `.trim()

  const propsUpdaterCalls = spec.properties.map((p) => {
    const name = escapeCppName(p.name)
    const setter = p.getSetterName('other')
    return `
if (props->${name}.isDirty) {
  view->${setter}(props->${name}.value);
  props->${name}.isDirty = false;
}
    `.trim()
  })
  const updaterJniCppCode = `
${createFileMetadataString(`J${stateUpdaterName}.cpp`)}

#include "J${stateUpdaterName}.hpp"
#include "views/${component}.hpp"
#include <NitroModules/NitroDefines.hpp>
#include <react/fabric/StateWrapperImpl.h>

namespace ${cxxNamespace} {

using namespace facebook;
using ConcreteStateData = react::ConcreteState<${stateClassName}>;

void J${stateUpdaterName}::updateViewProps(jni::alias_ref<jni::JClass> /* class */,
                                           jni::alias_ref<${JHybridTSpec}::javaobject> javaView,
                                           jni::alias_ref<JStateWrapper::javaobject> stateWrapperInterface) {
  ${JHybridTSpec}* view = javaView->cthis();

  // Get concrete StateWrapperImpl from passed StateWrapper interface object
  jobject rawStateWrapper = stateWrapperInterface.get();
  if (!stateWrapperInterface->isInstanceOf(react::StateWrapperImpl::javaClassStatic())) [[unlikely]] {
      throw std::runtime_error("StateWrapper is not a StateWrapperImpl");
  }
  auto stateWrapper = jni::alias_ref<react::StateWrapperImpl::javaobject>{
            static_cast<react::StateWrapperImpl::javaobject>(rawStateWrapper)};
  std::shared_ptr<const react::State> state = stateWrapper->cthis()->getState();
  auto concreteState = std::static_pointer_cast<const ConcreteStateData>(state);
  const ${stateClassName}& data = concreteState->getData();
  const std::shared_ptr<${propsClassName}>& props = data.getProps();
  if (props == nullptr) [[unlikely]] {
    // Props aren't set yet!
    throw std::runtime_error("${stateClassName}'s data doesn't contain any props!");
  }

  // Update all props if they are dirty
  ${indent(propsUpdaterCalls.join('\n'), '  ')}

  // Update hybridRef if it changed
  if (props->hybridRef.isDirty) {
    // hybridRef changed - call it with new this
    const auto& maybeFunc = props->hybridRef.value;
    if (maybeFunc.has_value()) {
      std::shared_ptr<${JHybridTSpec}> shared = javaView->cthis()->shared_cast<${JHybridTSpec}>();
      maybeFunc.value()(shared);
    }
    props->hybridRef.isDirty = false;
  }
}

} // namespace ${cxxNamespace}
`.trim()

  addJNINativeRegistration({
    namespace: cxxNamespace,
    className: `J${stateUpdaterName}`,
    import: {
      name: `views/J${stateUpdaterName}.hpp`,
      space: 'user',
      language: 'c++',
    },
  })

  return [
    ...cppFiles,
    {
      content: viewManagerCode,
      language: 'kotlin',
      name: `${manager}.kt`,
      platform: 'android',
      subdirectory: [...javaSubNamespace.split('.')],
    },
    {
      content: updaterKotlinCode,
      language: 'kotlin',
      name: `${stateUpdaterName}.kt`,
      platform: 'android',
      subdirectory: [...javaSubNamespace.split('.')],
    },
    {
      content: updaterJniHeaderCode,
      language: 'c++',
      name: `J${stateUpdaterName}.hpp`,
      platform: 'android',
      subdirectory: ['views'],
    },
    {
      content: updaterJniCppCode,
      language: 'c++',
      name: `J${stateUpdaterName}.cpp`,
      platform: 'android',
      subdirectory: ['views'],
    },
  ]
}
