function sorted(values: readonly number[]): number[] {
  return [...values].sort((left, right) => left - right)
}

export function quantile(
  values: readonly number[],
  percentile: number
): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate a quantile for an empty sample.')
  }
  if (percentile < 0 || percentile > 1) {
    throw new Error(`Percentile must be between 0 and 1, got ${percentile}.`)
  }

  const ordered = sorted(values)
  const position = (ordered.length - 1) * percentile
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.ceil(position)
  const lower = ordered[lowerIndex]!
  const upper = ordered[upperIndex]!
  return lower + (upper - lower) * (position - lowerIndex)
}

export function median(values: readonly number[]): number {
  return quantile(values, 0.5)
}

export function medianAbsoluteDeviation(values: readonly number[]): number {
  const center = median(values)
  return median(values.map((value) => Math.abs(value - center)))
}

export function robustCoefficientOfVariationPercent(
  values: readonly number[]
): number {
  const center = median(values)
  if (center === 0) return 0
  return (1.4826 * medianAbsoluteDeviation(values) * 100) / center
}

function hashSeed(seed: string): number {
  let value = 17
  for (let index = 0; index < seed.length; index++) {
    value = (value * 31 + seed.charCodeAt(index)) % 2_147_483_647
  }
  return value
}

function createRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

function resampleMedian(
  values: readonly number[],
  random: () => number
): number {
  const sample = new Array<number>(values.length)
  for (let index = 0; index < values.length; index++) {
    sample[index] = values[Math.floor(random() * values.length)]!
  }
  return median(sample)
}

export function bootstrapMedianConfidenceInterval(
  values: readonly number[],
  iterations: number,
  seed: string
): [number, number] {
  if (iterations < 1) {
    throw new Error('Bootstrap iterations must be positive.')
  }
  const random = createRandom(seed)
  const medians = new Array<number>(iterations)
  for (let index = 0; index < iterations; index++) {
    medians[index] = resampleMedian(values, random)
  }
  return [quantile(medians, 0.025), quantile(medians, 0.975)]
}

export function bootstrapPercentChangeConfidenceInterval(
  base: readonly number[],
  head: readonly number[],
  iterations: number,
  seed: string
): [number, number] {
  if (base.length === 0 || head.length === 0) {
    throw new Error('Both base and head samples are required.')
  }
  const random = createRandom(seed)
  const changes = new Array<number>(iterations)
  for (let index = 0; index < iterations; index++) {
    const baseMedian = resampleMedian(base, random)
    const headMedian = resampleMedian(head, random)
    changes[index] = (headMedian / baseMedian - 1) * 100
  }
  return [quantile(changes, 0.025), quantile(changes, 0.975)]
}
