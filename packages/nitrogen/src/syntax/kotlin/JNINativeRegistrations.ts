import type { SourceImport } from '../SourceFile.js'

export interface JNINativeRegistration {
  namespace: string
  className: string
  import: SourceImport
}

const jniNativeRegistrations: JNINativeRegistration[] = []

export function addJNINativeRegistration(
  registerFunc: JNINativeRegistration
): void {
  jniNativeRegistrations.push(registerFunc)
}

export function getJNINativeRegistrations(): JNINativeRegistration[] {
  return jniNativeRegistrations
}
