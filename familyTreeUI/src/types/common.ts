export enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

export type FieldTypeMap = {
  string: string;
  boolean: boolean;
  date: Date;
};

export type FieldDef = {
  name: string;
  type: keyof FieldTypeMap | readonly string[]; // Support for string enums
  required: boolean;
  label: string;
  default: string | boolean | Date | undefined;
};

export type FromFieldList<T extends readonly FieldDef[]> = {
  [K in T[number] as K["required"] extends true
    ? K["name"]
    : never]: K["type"] extends readonly string[]
    ? K["type"][number]
    : K["type"] extends keyof FieldTypeMap
    ? FieldTypeMap[K["type"]]
    : never;
} & {
  [K in T[number] as K["required"] extends false
    ? K["name"]
    : never]?: K["type"] extends readonly string[]
    ? K["type"][number]
    : K["type"] extends keyof FieldTypeMap
    ? FieldTypeMap[K["type"]]
    : never;
};