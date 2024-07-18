export function escapeCppName(string: string): string {
  // Replace non-alphanumeric characters with underscores
  let escapedStr = string.replace(/[^a-zA-Z0-9_]/g, '_')

  // Ensure the first character is a letter or underscore
  if (!/^[a-zA-Z_]/.test(escapedStr)) {
    escapedStr = '_' + escapedStr
  }

  return escapedStr
}
