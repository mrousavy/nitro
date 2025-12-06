package com.margelo.nitro.test

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.AnyMap

@Keep
@DoNotStrip
class HybridAnyMapBenchmark : HybridAnyMapBenchmarkSpec() {

  override fun createTestMap(entryCount: Double): AnyMap {
    val map = AnyMap(entryCount.toInt())
    for (i in 0 until entryCount.toInt()) {
      when (i % 5) {
        0 -> map.setDouble("key_$i", i.toDouble() * 1.5)
        1 -> map.setString("key_$i", "value_$i")
        2 -> map.setBoolean("key_$i", i % 2 == 0)
        3 -> map.setNull("key_$i")
        4 -> map.setBigInt("key_$i", i.toLong() * 1000000L)
      }
    }
    return map
  }

  override fun createNestedTestMap(entryCount: Double, nestingDepth: Double): AnyMap {
    val map = AnyMap(entryCount.toInt())
    for (i in 0 until entryCount.toInt()) {
      when (i % 3) {
        0 -> map.setDouble("key_$i", i.toDouble())
        1 -> map.setString("key_$i", "value_$i")
        2 -> {
          // Create nested array
          val nestedArray = Array(nestingDepth.toInt()) { j ->
            com.margelo.nitro.core.AnyValue(j.toDouble())
          }
          map.setAnyArray("key_$i", nestedArray)
        }
      }
    }
    return map
  }

  override fun benchmarkToMapOld(map: AnyMap, iterations: Double): BenchmarkResult {
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) { map.toMap() }
    val endTime = System.nanoTime()
    return createResult("toMap() [OLD]", iterations, startTime, endTime)
  }

  override fun benchmarkToMapFast(map: AnyMap, iterations: Double): BenchmarkResult {
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) { map.toMapFast() }
    val endTime = System.nanoTime()
    return createResult("toMapFast() [NEW]", iterations, startTime, endTime)
  }

  override fun benchmarkIndividualAccessOld(map: AnyMap, iterations: Double): BenchmarkResult {
    val keys = map.getAllKeys()
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) {
      for (key in keys) {
        when {
          map.isDouble(key) -> map.getDouble(key)
          map.isString(key) -> map.getString(key)
          map.isBoolean(key) -> map.getBoolean(key)
          map.isBigInt(key) -> map.getBigInt(key)
          map.isNull(key) -> null
          map.isArray(key) -> map.getAnyArray(key)
          map.isObject(key) -> map.getAnyObject(key)
        }
      }
    }
    val endTime = System.nanoTime()
    return createResult("Individual [OLD]", iterations, startTime, endTime)
  }

  override fun benchmarkIndividualAccessNew(map: AnyMap, iterations: Double): BenchmarkResult {
    val keys = map.getAllKeys()
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) {
      for (key in keys) {
        when (map.getType(key)) {
          AnyMap.TYPE_DOUBLE -> map.getDouble(key)
          AnyMap.TYPE_STRING -> map.getString(key)
          AnyMap.TYPE_BOOLEAN -> map.getBoolean(key)
          AnyMap.TYPE_BIGINT -> map.getBigInt(key)
          AnyMap.TYPE_NULL -> null
          AnyMap.TYPE_ARRAY -> map.getAnyArray(key)
          AnyMap.TYPE_OBJECT -> map.getAnyObject(key)
        }
      }
    }
    val endTime = System.nanoTime()
    return createResult("Individual [NEW]", iterations, startTime, endTime)
  }

  override fun benchmarkIterationOld(map: AnyMap, iterations: Double): BenchmarkResult {
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) {
      for (key in map.getAllKeys()) {
        map.getAny(key)
      }
    }
    val endTime = System.nanoTime()
    return createResult("Iteration [OLD]", iterations, startTime, endTime)
  }

  override fun benchmarkIterationNew(map: AnyMap, iterations: Double): BenchmarkResult {
    val startTime = System.nanoTime()
    repeat(iterations.toInt()) {
      val keysWithTypes = map.getAllKeysWithTypes()
      var i = 0
      while (i < keysWithTypes.size) {
        val key = keysWithTypes[i]
        when (keysWithTypes[i + 1].toInt()) {
          AnyMap.TYPE_DOUBLE -> map.getDouble(key)
          AnyMap.TYPE_STRING -> map.getString(key)
          AnyMap.TYPE_BOOLEAN -> map.getBoolean(key)
          AnyMap.TYPE_BIGINT -> map.getBigInt(key)
          AnyMap.TYPE_ARRAY -> map.getAnyArray(key)
          AnyMap.TYPE_OBJECT -> map.getAnyObject(key)
        }
        i += 2
      }
    }
    val endTime = System.nanoTime()
    return createResult("Iteration [NEW]", iterations, startTime, endTime)
  }

  private fun createResult(name: String, iterations: Double, startTime: Long, endTime: Long): BenchmarkResult {
    val totalTimeMs = (endTime - startTime) / 1_000_000.0
    val avgTimeMs = totalTimeMs / iterations
    return BenchmarkResult(name, iterations, totalTimeMs, avgTimeMs, if (avgTimeMs > 0) 1000.0 / avgTimeMs else 0.0)
  }

  override fun runAllBenchmarks(entryCount: Double, iterations: Double): Array<BenchmarkResult> {
    val map = createTestMap(entryCount)

    return arrayOf(
      benchmarkToMapOld(map, iterations),
      benchmarkToMapFast(map, iterations),
      benchmarkIndividualAccessOld(map, iterations),
      benchmarkIndividualAccessNew(map, iterations),
      benchmarkIterationOld(map, iterations),
      benchmarkIterationNew(map, iterations)
    )
  }

  override val memorySize: Long
    get() = 0L
}

