import { describe, expect, test } from 'bun:test'
import {
  bootstrapMedianConfidenceInterval,
  bootstrapPercentChangeConfidenceInterval,
  median,
  medianAbsoluteDeviation,
  quantile,
  robustCoefficientOfVariationPercent,
} from '../../apps/benchmark/src/benchmarks/statistics'

describe('benchmark statistics', () => {
  test('calculates robust summary statistics', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
    expect(quantile([1, 2, 3, 4, 5], 0.95)).toBeCloseTo(4.8)
    expect(medianAbsoluteDeviation([1, 2, 3, 4, 100])).toBe(1)
    expect(
      robustCoefficientOfVariationPercent([98, 99, 100, 101, 102])
    ).toBeCloseTo(1.4826)
  })

  test('produces deterministic bootstrap intervals', () => {
    const first = bootstrapMedianConfidenceInterval(
      [9, 10, 11, 12, 13],
      1_000,
      'seed'
    )
    const second = bootstrapMedianConfidenceInterval(
      [9, 10, 11, 12, 13],
      1_000,
      'seed'
    )
    expect(first).toEqual(second)
    expect(first[0]).toBeLessThanOrEqual(11)
    expect(first[1]).toBeGreaterThanOrEqual(11)
  })

  test('detects a clear percent change', () => {
    const interval = bootstrapPercentChangeConfidenceInterval(
      [99, 100, 100, 101, 100],
      [114, 115, 115, 116, 115],
      2_000,
      'regression'
    )
    expect(interval[0]).toBeGreaterThan(10)
    expect(interval[1]).toBeLessThan(20)
  })
})
