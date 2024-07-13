import type { Node } from 'ts-morph'
import { ts } from 'ts-morph'

export function getNodeName(node: Node<ts.Node>): string {
  const identifier = node.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier)
  return identifier.getText()
}
