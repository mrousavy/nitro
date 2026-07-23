import type { SourceFile } from '../../syntax/SourceFile.js'
import type { HybridObjectSpec } from '../../syntax/HybridObjectSpec.js'
import { createFileMetadataString } from '../../syntax/helpers.js'
import { getHybridObjectName } from '../../syntax/getHybridObjectName.js'
import { KotlinCxxBridgedType } from '../../syntax/kotlin/KotlinCxxBridgedType.js'
import { getViewComponentNames } from '../CppHybridViewComponent.js'
import { buildMeasurePropsStruct } from '../createViewMeasurerShared.js'

export function getKotlinMeasurerName(spec: HybridObjectSpec): string {
  const { HybridT } = getHybridObjectName(spec.name)
  return `${HybridT}Measurer`
}

/**
 * Generates the Android side of `MeasurableView`:
 *  - the props Nitro struct (Kotlin data class + `J<Props>` fbjni bridge),
 *  - a Kotlin trampoline `object` that resolves the impl's companion (once,
 *    cached) and forwards `measureContent`,
 *  - a C++ fbjni wrapper that calls that trampoline with cached method ids,
 *  - a C++ installer that, at startup, sets the ShadowNode's lock-free
 *    `measureFunction` iff the impl conforms.
 */
export function createKotlinViewMeasurer(spec: HybridObjectSpec): SourceFile[] {
  const implementation = spec.config.getAndroidAutolinkedImplementation(
    spec.name
  )
  if (implementation?.language !== 'kotlin') {
    throw new Error(
      `Cannot create Kotlin MeasurableView trampoline for ${spec.name} - it must be autolinked with a Kotlin Android implementation in nitro.json!`
    )
  }
  const viewImpl = implementation.implementationClassName
  const measurerName = getKotlinMeasurerName(spec)
  const { propsClassName, shadowNodeClassName, component } =
    getViewComponentNames(spec)
  const propsStruct = buildMeasurePropsStruct(spec, ['kotlin', 'c++'])
  const propsStructName = propsStruct.structName
  const propsStructCxxName = propsStruct.getCode('c++', {
    fullyQualified: true,
  })

  const javaSubNamespace = spec.config.getAndroidPackage('java/kotlin', 'views')
  const javaNamespace = spec.config.getAndroidPackage('java/kotlin')
  const cxxNamespace = spec.config.getCxxNamespace('c++', 'views')
  const jniClassDescriptor = spec.config.getAndroidPackage(
    'c++/jni',
    'views',
    measurerName
  )

  const kotlinFile: SourceFile = {
    name: `${measurerName}.kt`,
    platform: 'android',
    language: 'kotlin',
    subdirectory: javaSubNamespace.split('.'),
    content: `
${createFileMetadataString(`${measurerName}.kt`)}

package ${javaSubNamespace}

import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.views.LayoutConstraints
import com.margelo.nitro.views.LayoutContext
import com.margelo.nitro.views.MeasurableView
import com.margelo.nitro.views.Size
import ${javaNamespace}.*

/**
 * Bridges the C++ ShadowNode's \`measureContent\` to ${viewImpl}'s
 * \`MeasurableView<${propsStructName}>\` companion. Do not call directly.
 */
@DoNotStrip
object ${measurerName} {
  // Resolved once (lazily, at first registration touch) and cached. The companion
  // holds the pure, static measure function - no view instance, no Context, no
  // main-thread construction. Reflection here is one-time; the per-measure path is
  // a typed, direct virtual call (the \`<${propsStructName}>\` generic is what keeps
  // it reflection-free).
  @Suppress("UNCHECKED_CAST")
  private val measurer: MeasurableView<${propsStructName}>? = run {
    try {
      val field = ${viewImpl}::class.java.getDeclaredField("Companion")
      field.isAccessible = true
      field.get(null) as? MeasurableView<${propsStructName}>
    } catch (e: NoSuchFieldException) {
      null
    }
  }

  @JvmStatic
  @DoNotStrip
  fun isMeasurable(): Boolean = measurer != null

  // Returns the measured size packed into a Long - width in the high 32 bits,
  // height in the low 32 bits, each as raw IEEE-754 float bits. This matches
  // React Native's own measure path (\`yogaMeassureToSize\`) and avoids allocating
  // a Size object across JNI on the measure hot-path.
  @JvmStatic
  @DoNotStrip
  fun measure(props: ${propsStructName},
              pointScaleFactor: Double,
              isRTL: Boolean,
              minWidth: Double,
              minHeight: Double,
              maxWidth: Double,
              maxHeight: Double): Long {
    val m = measurer ?: error("${viewImpl} must expose companion object : MeasurableView<${propsStructName}> before ${measurerName}.measure is called.")
    val size = m.measureContent(
      props,
      LayoutContext(pointScaleFactor, isRTL),
      LayoutConstraints(Size(minWidth, minHeight), Size(maxWidth, maxHeight))
    )
    val w = size.width.toFloat().toRawBits().toLong() and 0xFFFFFFFFL
    val h = size.height.toFloat().toRawBits().toLong() and 0xFFFFFFFFL
    return (w shl 32) or h
  }
}
`.trim(),
  }

  const headerName = `J${measurerName}.hpp`
  const jProps = `J${propsStructName}`
  const cxxFile: SourceFile = {
    name: headerName,
    platform: 'android',
    language: 'c++',
    subdirectory: ['views'],
    content: `
${createFileMetadataString(headerName)}

#pragma once

#include <fbjni/fbjni.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/core/LayoutContext.h>
#include <react/renderer/core/conversions.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/graphics/Size.h>

#include "${jProps}.hpp"
#include "views/${component}.hpp"

namespace ${cxxNamespace} {

  using namespace facebook;

  /**
   * C++ <-> Kotlin bridge for the "${spec.name}" measurer. All \`jclass\`/method
   * lookups are cached; the per-measure path is one cached static call.
   */
  struct J${measurerName} final: public jni::JavaClass<J${measurerName}> {
    static constexpr auto kJavaDescriptor = "L${jniClassDescriptor};";

    /** Whether the Kotlin impl's companion conforms to \`MeasurableView\`. */
    static bool isMeasurable() {
      static const auto method = javaClassStatic()->getStaticMethod<jboolean()>("isMeasurable");
      return method(javaClassStatic());
    }

    /**
     * Installs the lock-free measure function on the ShadowNode iff the impl is
     * measurable. Called once at startup (JVM attached).
     */
    static void install() {
      if (!isMeasurable()) {
        return;
      }
      ${shadowNodeClassName}::measureFunction.store(
        [](const react::ViewProps& propsBase,
           const react::LayoutContext& layoutContext,
           const react::LayoutConstraints& layoutConstraints) -> react::Size {
          // Attach this (Yoga/shadow) thread to the JVM for the call. fbjni
          // no-ops if the thread is already attached (Fabric usually is).
          jni::ThreadScope scope;
          const auto& props = static_cast<const ${propsClassName}&>(propsBase);
          ${propsStructCxxName} measureProps = ${reMeasurePropsCtor(spec, propsStructCxxName)};

          // Kotlin returns the size packed into a jlong (width<<32 | height, each
          // as raw float bits); \`yogaMeassureToSize\` unpacks it. No Size object is
          // allocated across JNI - same scheme RN's own measure path uses.
          static const auto measure = javaClassStatic()
            ->getStaticMethod<jlong(jni::alias_ref<${jProps}::javaobject>, jdouble, jboolean, jdouble, jdouble, jdouble, jdouble)>("measure");
          jlong packed = measure(
            javaClassStatic(),
            ${jProps}::fromCpp(measureProps),
            layoutContext.pointScaleFactor,
            static_cast<jboolean>(layoutConstraints.layoutDirection == react::LayoutDirection::RightToLeft),
            layoutConstraints.minimumSize.width,
            layoutConstraints.minimumSize.height,
            layoutConstraints.maximumSize.width,
            layoutConstraints.maximumSize.height);
          return react::yogaMeassureToSize(packed);
        },
        std::memory_order_release);
    }
  };

} // namespace ${cxxNamespace}
`.trim(),
  }

  const structFiles = [
    ...propsStruct.getExtraFiles(),
    ...new KotlinCxxBridgedType(propsStruct).getExtraFiles(),
  ]
  return [...structFiles, kotlinFile, cxxFile]
}

function reMeasurePropsCtor(
  spec: HybridObjectSpec,
  propsStructCxxName: string
): string {
  const props = spec.properties.filter((p) => p.type.kind !== 'function')
  const fields = props.map((p) => `props.${p.name}.value`).join(', ')
  return `${propsStructCxxName} { ${fields} }`
}
