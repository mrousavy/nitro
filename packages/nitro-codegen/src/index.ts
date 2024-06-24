import { Project, ts } from "ts-morph"

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

  const properties = module.getChildrenOfKind(ts.SyntaxKind.PropertySignature).filter(p => p.getFirstChildByKind(ts.SyntaxKind.FunctionType) == null)
  const methods: string[] = []
  for (const prop of properties) {
    const name = prop.getLastChildByKindOrThrow(ts.SyntaxKind.Identifier).getText()
    const isReadonly = prop.getFirstChildByKind(ts.SyntaxKind.ReadonlyKeyword) != null
    const type = prop.getChildAtIndex(1)
    // @ts-expect-error
    const cppType = typeMap[type.getKind()]

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
    methods.push(`virtual ${cppType} get${capitalizedName}() = 0;`)

    if (!isReadonly) {
      methods.push(`virtual void set${capitalizedName}(${cppType} value) = 0;`)
    }
  }

  let cppCode = `
class ${name}: public HybridObject {
  public:
    ${methods.join('\n    ')}
};
    `

  console.log(cppCode)
}


