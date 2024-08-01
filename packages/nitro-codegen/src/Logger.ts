export const Logger = {
  log(message: unknown, ...extra: unknown[]) {
    console.log(message, ...extra)
  },
}
