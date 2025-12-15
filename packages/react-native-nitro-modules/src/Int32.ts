/**
 * Represents a 32-bit signed integer.
 *
 * Since numbers in JS are 64-bit doubles, {@linkcode Int32}
 * requires runtime conversion and may throw.
 *
 * @throws If a floating point number is passed.
 * @throws If the number is out of range.
 */
export type Int32 = number & { __int32Tag?: never }
