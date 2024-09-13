export interface Code {
  /** Imports required by the code */
  imports: Import[];
  /** Code includes an await */
  hasAwaits?(): boolean;
  /** Code returns a promise */
  returnsPromise?(): boolean;
  toString(): string;
}

export interface Import extends Code {
  moduleSpecifier: string;
  moduleExportName?: string | "*" | "default";
  inline?: boolean;
  importedBinding?: string;
}

export type Resolver = (moduleSpecifier: string) => string;
