export interface HybridObjectName {
  /**
   * The raw name of the Hybrid Object.
   * @example "Image"
   */
  T: string
  /**
   * The name of the Swift protocol/Kotlin interface.
   * @example "ImageSpec"
   */
  TSpec: string
  /**
   * The name of the Swift protocol wrapper class that bridges to C++.
   * @example "ImageSpecCxx"
   */
  TSpecCxx: string
  /**
   * The name of the Java/C++ (FB-JNI) HybridClass that bridges C++ to Java.
   * @example "JImageSpec"
   */
  JTSpec: string
  /**
   * The name of the C++ class that actually represents the Hybrid Object.
   * @example "HybridImage"
   */
  HybridT: string
  /**
   * The name of the C++ class that actually bridges to the Java Hybrid Object.
   * @example "JHybridImage"
   */
  JHybridT: string
  /**
   * The name of the C++ class that extends the Hybrid Object and bridges over to the Swift C++ wrapper class.
   * @example "HybridImageSwift"
   */
  HybridTSwift: string
}

export function getHybridObjectName(
  hybridObjectName: string
): HybridObjectName {
  return {
    T: hybridObjectName,
    TSpec: `${hybridObjectName}Spec`,
    TSpecCxx: `${hybridObjectName}SpecCxx`,
    JTSpec: `J${hybridObjectName}Spec`,
    JHybridT: `JHybrid${hybridObjectName}`,
    HybridT: `Hybrid${hybridObjectName}`,
    HybridTSwift: `Hybrid${hybridObjectName}Swift`,
  }
}
