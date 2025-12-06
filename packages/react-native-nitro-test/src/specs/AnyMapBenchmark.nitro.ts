import { type HybridObject, type AnyMap } from 'react-native-nitro-modules'

/**
 * Benchmark results for AnyMap operations
 */
export interface BenchmarkResult {
  operationName: string
  iterations: number
  totalTimeMs: number
  averageTimeMs: number
  opsPerSecond: number
}

/**
 * A HybridObject for benchmarking AnyMap performance.
 * Tests old vs new (P0 optimized) methods.
 */
export interface AnyMapBenchmark
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Create a test AnyMap with the specified number of entries.
   * Mix of primitives: numbers, strings, booleans, nulls
   */
  createTestMap(entryCount: number): AnyMap

  /**
   * Create a nested AnyMap with arrays and objects.
   */
  createNestedTestMap(entryCount: number, nestingDepth: number): AnyMap

  /**
   * Benchmark: Old toMap() method (sequential isX + getX calls)
   */
  benchmarkToMapOld(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Benchmark: New toMapFast() method (batch operations)
   */
  benchmarkToMapFast(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Benchmark: Individual key access with old method (isX + getX pattern)
   */
  benchmarkIndividualAccessOld(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Benchmark: Individual key access with new getType() method
   */
  benchmarkIndividualAccessNew(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Benchmark: Iterating all keys and values with old method
   */
  benchmarkIterationOld(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Benchmark: Iterating all keys and values with getAllKeysWithTypes()
   */
  benchmarkIterationNew(map: AnyMap, iterations: number): BenchmarkResult

  /**
   * Run all benchmarks and return results
   */
  runAllBenchmarks(entryCount: number, iterations: number): BenchmarkResult[]
}

