import type { HybridObjectSpec } from './syntax/HybridObjectSpec.js'

const allHybridObjects: HybridObjectSpec[] = []

export function addHybridObject(spec: HybridObjectSpec): void {
  if (
    allHybridObjects.some(
      (h) => h.name === spec.name && h.language === spec.language
    )
  ) {
    throw new Error(
      `Cannot create Hybrid Object "${spec.name}" - a Hybrid Object with the same name already exists!`
    )
  }
  allHybridObjects.push(spec)
}

export function getAllKnownHybridObjects(): HybridObjectSpec[] {
  return allHybridObjects
}
