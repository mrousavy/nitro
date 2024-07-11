import type { InterfaceDeclaration } from 'ts-morph';
import { ts } from 'ts-morph';

export function getInterfaceName(module: InterfaceDeclaration): string {
  return module.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier).getText();
}
