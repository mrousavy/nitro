export function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function indent(string: string, indentation: string): string {
  return string.replaceAll('\n', `\n${indentation}`)
}

// function getStack(error: Error): string | undefined {
//   if (error.stack == null) return undefined

//   const stack = error.stack.split('\n')
//   if (
//     stack[0] === `${error.name}: ${error.message}` ||
//     stack[0] === error.message
//   ) {
//     // remove the first item if it's already
//     stack.shift()
//   }
//   return stack.join('\n')
// }

export function errorToString(error: unknown): string {
  if (error == null) {
    return `null`
  }
  if (typeof error !== 'object') {
    return `${error}`
  }
  if (error instanceof Error) {
    let message = `${error.name}: ${error.message}`
    if (error.cause != null) {
      message += ` (cause: ${JSON.stringify(error.cause)})`
    }
    return message
  }
  if ('toString' in error) {
    return error.toString()
  }
  return JSON.stringify(error)
}
