import type { EdgeTypes } from "@xyflow/react";
import MarriageEdge from "./Components/Edges/MarriageEdge";
import ParentEdge from "./Components/Edges/ParentEdge";
import BelongsEdge from "./Components/Edges/BelongsEdge";
export enum Edges {
  MARRIED_TO = "MARRIED_TO",
  PARENT_OF = "PARENT_OF",
  BELONGS_TO = "BELONGS_TO",
}

export type EdgeField = {
  readonly name: string;
  readonly label: string;
  readonly type: "string" | "date" | "boolean" | readonly string[];
  readonly required: boolean;
  readonly default?: string | boolean | Date | readonly string[] | undefined;
};

export type EdgeFieldsCollection = {
  readonly [K in Edges]: readonly EdgeField[];
};

export const edgeFieldTemplates: EdgeFieldsCollection = {
  [Edges.MARRIED_TO]: [
    { name: "dateOfMarriage", label: "Date of Marriage", type: "date", required: false, default: undefined },
    { name: "location", label: "Location", type: "string", required: false, default: "" },
    { name: "status", label: "Status", type: ["married", "divorced", "separated"], required: false, default: "married" } 
  ],
  [Edges.PARENT_OF]: [],
  [Edges.BELONGS_TO]: [],
};

export type EdgeData = Record<string, string | number | boolean | Date | undefined | null>;

export type EdgeDataMap = {
  [K in Edges]: EdgeData; // This could be refined further based on the actual fields in edgeFieldTemplates
};

export const edgeTypes = {
  [Edges.MARRIED_TO]: MarriageEdge,
  [Edges.PARENT_OF]: ParentEdge,
  [Edges.BELONGS_TO]: BelongsEdge,
  // Add your custom edge types here!
} satisfies EdgeTypes;

export type AppEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, any>;
};
