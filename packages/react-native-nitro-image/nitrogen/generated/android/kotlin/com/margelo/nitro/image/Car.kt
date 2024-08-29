///
/// Car.kt
/// Thu Aug 29 2024
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2024 Marc Rousavy @ Margelo
///

package com.margelo.nitro.image

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip

/**
 * Represents the JavaScript object/struct "Car".
 */
@DoNotStrip
@Keep
data class Car(
  val year: Double,
  val make: String,
  val model: String,
  val power: Double,
  val powertrain: Powertrain,
  val driver: Person?
)
