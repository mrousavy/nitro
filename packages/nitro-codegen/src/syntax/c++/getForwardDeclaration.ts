type DeclarationKind = 'class' | 'struct'

export function getForwardDeclaration(
  kind: DeclarationKind,
  className: string,
  namespace?: string
): string {
  if (namespace != null) {
    return `
namespace ${namespace} {
  // Forward declaration of \`${className}\` to properly resolve imports.
  ${kind} ${className};
  } // namespace ${namespace}
  `.trim()
  } else {
    return `
// Forward declaration of \`${className}\` to properly resolve imports.
${kind} ${className};
    `.trim()
  }
}
