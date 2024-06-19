const Nitro = require('./NativeNitro').default;

export function multiply(a: number, b: number): number {
  return Nitro.multiply(a, b);
}
