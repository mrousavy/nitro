import { Node, Project, ts } from "ts-morph"

const project = new Project({ })
const file = project.addSourceFileAtPath('./src/Person.nitro.ts')

const typeMap = {
  [ts.SyntaxKind.VoidKeyword]: "void",
  [ts.SyntaxKind.NumberKeyword]: "double",
  [ts.SyntaxKind.BooleanKeyword]: "bool",
  [ts.SyntaxKind.StringKeyword]: "std::string",
  [ts.SyntaxKind.BigIntKeyword]: "int64_t",
} as const

const interfaces = file.getChildrenOfKind(ts.SyntaxKind.InterfaceDeclaration)
for (const module of interfaces) {
  const identifier = module.getFirstChildByKind(ts.SyntaxKind.Identifier)
  if (identifier == null) throw new Error("Interface name cannot be null!")
  const name = identifier.getText()


  function getTypeOfChild(child: Node<ts.Node>): ts.SyntaxKind {
    return child.getLastChildOrThrow().getKind()
  }

  const cppProperties: string[] = []

  const properties = module.getChildrenOfKind(ts.SyntaxKind.PropertySignature).filter(p => p.getFirstChildByKind(ts.SyntaxKind.FunctionType) == null)
  for (const prop of properties) {
    const name = prop.getLastChildByKindOrThrow(ts.SyntaxKind.Identifier).getText()
    const isReadonly = prop.getFirstChildByKind(ts.SyntaxKind.ReadonlyKeyword) != null
    const type = getTypeOfChild(prop)
    // @ts-expect-error
    const cppType = typeMap[type]

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
    cppProperties.push(`virtual ${cppType} get${capitalizedName}() = 0;`)

    if (!isReadonly) {
      cppProperties.push(`virtual void set${capitalizedName}(${cppType} value) = 0;`)
    }
  }


  const cppMethods: string[] = []

  const functions = module.getChildrenOfKind(ts.SyntaxKind.MethodSignature)
  for (const func of functions) {
    const name = func.getLastChildByKindOrThrow(ts.SyntaxKind.Identifier).getText()
    const returnType = getTypeOfChild(func)
    // @ts-expect-error
    const returnTypeCpp = typeMap[returnType]
    const parameters = func.getChildrenOfKind(ts.SyntaxKind.Parameter).map((p) => {
      const name = p.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier).getText()
      const type = getTypeOfChild(p)
      // @ts-expect-error
      const cppType = typeMap[type]
      return `${cppType} ${name}`
    })

    cppMethods.push(`virtual ${returnTypeCpp} ${name}(${parameters.join(', ')}) = 0;`)
  }

  let cppCode = `
class ${name}: public HybridObject {
  public:
    // Properties
    ${cppProperties.join('\n    ')}

  public:
    // Methods
    ${cppMethods.join('\n    ')}
};
    `

  console.log(cppCode)
}


