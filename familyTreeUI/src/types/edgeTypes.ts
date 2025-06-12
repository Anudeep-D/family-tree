import type { EdgeTypes } from "@xyflow/react";
import MarriageEdge from "./Components/Edges/MarriageEdge";
import ParentEdge from "./Components/Edges/ParentEdge";
import BelongsEdge from "./Components/Edges/BelongsEdge";
export enum Edges {
  MARRIED_TO = "MARRIED_TO",
  PARENT_OF = "PARENT_OF",
  BELONGS_TO = "BELONGS_TO",
}

export const edgeFieldTemplates = {
  [Edges.MARRIED_TO]: {
    label: "",
  },
  [Edges.PARENT_OF]: {
    label: "",
  },
  [Edges.BELONGS_TO]: {
    label: "",
  },
} as const;

export type EdgeDataMap = {
  [K in Edges]: (typeof edgeFieldTemplates)[K];
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
