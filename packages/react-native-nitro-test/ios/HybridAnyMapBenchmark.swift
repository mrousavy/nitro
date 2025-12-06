//
//  HybridAnyMapBenchmark.swift
//  Pods
//
//  Created by Ritesh Shukla on 07/12/25.
//

import Foundation
import NitroModules

class HybridAnyMapBenchmark: HybridAnyMapBenchmarkSpec {
  var memorySize: Int { 0 }

  func createTestMap(entryCount: Double) throws -> AnyMap {
    let map = AnyMap(withPreallocatedSize: Int(entryCount))
    for i in 0..<Int(entryCount) {
      switch i % 5 {
      case 0:
        map.setDouble(key: "key_\(i)", value: Double(i) * 1.5)
      case 1:
        map.setString(key: "key_\(i)", value: "value_\(i)")
      case 2:
        map.setBoolean(key: "key_\(i)", value: i % 2 == 0)
      case 3:
        map.setNull(key: "key_\(i)")
      case 4:
        map.setBigInt(key: "key_\(i)", value: Int64(i) * 1000000)
      default:
        break
      }
    }
    return map
  }

  func createNestedTestMap(entryCount: Double, nestingDepth: Double) throws -> AnyMap {
    let map = AnyMap(withPreallocatedSize: Int(entryCount))
    for i in 0..<Int(entryCount) {
      switch i % 3 {
      case 0: map.setDouble(key: "key_\(i)", value: Double(i))
      case 1: map.setString(key: "key_\(i)", value: "value_\(i)")
      case 2:
        let nestedArray = (0..<Int(nestingDepth)).map { AnyValue.number(Double($0)) }
        map.setArray(key: "key_\(i)", value: nestedArray)
      default: break
      }
    }
    return map
  }

  func benchmarkToMapOld(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) { _ = map.toDictionary() }
    return createResult("toDictionary() [OLD]", iterations, startTime)
  }

  func benchmarkToMapFast(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) { _ = map.toDictionaryFast() }
    return createResult("toDictionaryFast() [NEW]", iterations, startTime)
  }

  func benchmarkIndividualAccessOld(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let keys = map.getAllKeys()
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) {
      for key in keys {
        if map.isDouble(key: key) { _ = map.getDouble(key: key) }
        else if map.isString(key: key) { _ = map.getString(key: key) }
        else if map.isBool(key: key) { _ = map.getBoolean(key: key) }
        else if map.isBigInt(key: key) { _ = map.getBigInt(key: key) }
        else if map.isNull(key: key) { }
        else if map.isArray(key: key) { _ = map.getArray(key: key) }
        else if map.isObject(key: key) { _ = map.getObject(key: key) }
      }
    }
    return createResult("Individual [OLD]", iterations, startTime)
  }

  func benchmarkIndividualAccessNew(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let keys = map.getAllKeys()
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) {
      for key in keys {
        switch map.getType(key: key) {
        case 0: break
        case 1: _ = map.getBoolean(key: key)
        case 2: _ = map.getDouble(key: key)
        case 3: _ = map.getBigInt(key: key)
        case 4: _ = map.getString(key: key)
        case 5: _ = map.getArray(key: key)
        case 6: _ = map.getObject(key: key)
        default: break
        }
      }
    }
    return createResult("Individual [NEW]", iterations, startTime)
  }

  func benchmarkIterationOld(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) {
      for key in map.getAllKeys() { _ = map.getAny(key: key) }
    }
    return createResult("Iteration [OLD]", iterations, startTime)
  }

  func benchmarkIterationNew(map: AnyMap, iterations: Double) throws -> BenchmarkResult {
    let startTime = CFAbsoluteTimeGetCurrent()
    for _ in 0..<Int(iterations) { _ = map.toDictionaryFast() }
    return createResult("Iteration [NEW]", iterations, startTime)
  }

  func runAllBenchmarks(entryCount: Double, iterations: Double) throws -> [BenchmarkResult] {
    let map = try createTestMap(entryCount: entryCount)
    return [
      try benchmarkToMapOld(map: map, iterations: iterations),
      try benchmarkToMapFast(map: map, iterations: iterations),
      try benchmarkIndividualAccessOld(map: map, iterations: iterations),
      try benchmarkIndividualAccessNew(map: map, iterations: iterations),
      try benchmarkIterationOld(map: map, iterations: iterations),
      try benchmarkIterationNew(map: map, iterations: iterations)
    ]
  }

  private func createResult(_ name: String, _ iterations: Double, _ startTime: CFAbsoluteTime) -> BenchmarkResult {
    let totalTimeMs = (CFAbsoluteTimeGetCurrent() - startTime) * 1000
    let avgTimeMs = totalTimeMs / iterations
    return BenchmarkResult(operationName: name, iterations: iterations, totalTimeMs: totalTimeMs,
                           averageTimeMs: avgTimeMs, opsPerSecond: avgTimeMs > 0 ? 1000.0 / avgTimeMs : 0)
  }
}

