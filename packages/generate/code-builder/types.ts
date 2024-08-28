export interface Code {
  imports?: Import[];
  async?: boolean;
  toString(): string;
}

export interface Import {
  moduleSpecifier: string;
  moduleExportName?: string | "*" | "default";
  inline?: boolean;
  importedBinding?: string;
  toString(): string;
}

export type Resolver = (moduleSpecifier: string) => string;
