export enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

export type FieldTypeMap = {
  string: string;
  boolean: boolean;
  date: Date; // Assuming Date objects are used in form state, adjust if serialized to string
  jobObject: {
    jobType?: string;
    employer?: string;
    jobTitle?: string;
  };
  educationObject: {
    fieldOfStudy?: string;
    highestQualification?: string;
    institution?: string;
    location?: string;
  };
};

export type FieldDef = {
  readonly name: string; // Make fields readonly as in NodeFieldDefinition
  readonly label: string;
  readonly type: keyof FieldTypeMap | readonly string[];
  readonly required: boolean;
  readonly default?: any; // Using 'any' for default as it can be string, boolean, Date, or undefined. Specificity can be improved if needed.
  readonly isField: boolean; // Added isField
  readonly subFields?: readonly FieldDef[]; // Added optional subFields
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