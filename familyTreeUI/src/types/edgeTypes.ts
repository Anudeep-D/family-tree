import type { EdgeTypes } from "@xyflow/react";
import RelationEdge from "./Components/Edges/RelationEdge";
import MarriageEdge from "./Components/Edges/MarriageEdge";
import ParentEdge from "./Components/Edges/ParentEdge";
import BelongsEdge from "./Components/Edges/BelongsEdge";

export const edgeTypes = {
  "relation-edge": RelationEdge,
  MARRIED_TO: MarriageEdge,
  PARENT_OF: ParentEdge,
  BELONGS_TO: BelongsEdge,
  // Add your custom edge types here!
} satisfies EdgeTypes;

export type AppEdge = {
  id: string;
  source:string;
  target:string;
  type?:string
  data?: Record<string, any>;
};
