///
/// Car.kt
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.*

/**
 * Represents the JavaScript object/struct "Car".
 */
@DoNotStrip
@Keep
data class Car
  @DoNotStrip
  @Keep
  constructor(
    val year: Double,
    val make: String,
    val model: String,
    val power: Double,
    val powertrain: Powertrain,
    val driver: Person?,
    val isFast: Boolean?
  ) {
  /* main constructor */
}
