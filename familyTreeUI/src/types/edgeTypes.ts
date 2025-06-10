import type { Edge, EdgeTypes, BuiltInEdge } from "@xyflow/react";
import { LabeledEdge } from "./Components/Edges/LabeledEdge";
import RelationEdge from "./Components/Edges/RelationEdge";
import MarriageEdge from "./Components/Edges/MarriageEdge";
import ParentEdge from "./Components/Edges/ParentEdge";
import BelongsEdge from "./Components/Edges/BelongsEdge";

export const edgeTypes = {
  "labeled-edge": LabeledEdge,
  "relation-edge": RelationEdge,
  "MARRIED_TO": MarriageEdge,
  "PARENT_OF": ParentEdge,
  "BELONGS_TO": BelongsEdge,
  // Add your custom edge types here!
} satisfies EdgeTypes;

export type BaseEdge = Edge<
  {
    label?: string;
    data?: Record<string, any>;
  },
  string
>;

export type AppEdge = BuiltInEdge | BaseEdge;
