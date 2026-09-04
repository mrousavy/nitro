import {
  median,
  quantile,
} from '../../apps/benchmark/src/benchmarks/statistics'

function createRandom(seed: string): () => number {
  let state = 17
  for (let index = 0; index < seed.length; index++) {
    state = (state * 31 + seed.charCodeAt(index)) % 2_147_483_647
  }
  if (state === 0) state = 1
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

function validateRuns(
  runs: readonly (readonly number[])[],
  iterations: number
): void {
  if (
    runs.length === 0 ||
    runs.some(
      (samples) =>
        samples.length === 0 ||
        samples.some((value) => !Number.isFinite(value) || value <= 0)
    ) ||
    !Number.isInteger(iterations) ||
    iterations < 1
  ) {
    throw new Error(
      'Bootstrap needs non-empty positive samples and iterations.'
    )
  }
}

function resampleRun(
  run: readonly number[],
  random: () => number,
  samples: number[]
): void {
  for (let sample = 0; sample < run.length; sample++) {
    samples.push(run[Math.floor(random() * run.length)]!)
  }
}

/** Resample matched process runs first, then their batches (not iid batches). */
export function bootstrapPairedRunChange(
  base: readonly (readonly number[])[],
  head: readonly (readonly number[])[],
  iterations: number,
  seed: string
): [number, number] {
  validateRuns(base, iterations)
  validateRuns(head, iterations)
  if (base.length !== head.length) {
    throw new Error('Paired bootstrap needs matching non-empty runs.')
  }
  const random = createRandom(seed)

  const changes = new Array<number>(iterations)
  for (let iteration = 0; iteration < iterations; iteration++) {
    const baseSamples: number[] = []
    const headSamples: number[] = []
    for (let pair = 0; pair < base.length; pair++) {
      // Preserve the matching base/head process pair when sampling blocks.
      const runIndex = Math.floor(random() * base.length)
      resampleRun(base[runIndex]!, random, baseSamples)
      resampleRun(head[runIndex]!, random, headSamples)
    }
    changes[iteration] = (median(headSamples) / median(baseSamples) - 1) * 100
  }
  return [quantile(changes, 0.025), quantile(changes, 0.975)]
}

export function bootstrapRunMedian(
  runs: readonly (readonly number[])[],
  iterations: number,
  seed: string
): [number, number] {
  validateRuns(runs, iterations)
  const random = createRandom(seed)
  const medians = new Array<number>(iterations)
  for (let iteration = 0; iteration < iterations; iteration++) {
    const samples: number[] = []
    for (let block = 0; block < runs.length; block++) {
      resampleRun(runs[Math.floor(random() * runs.length)]!, random, samples)
    }
    medians[iteration] = median(samples)
  }
  return [quantile(medians, 0.025), quantile(medians, 0.975)]
}
