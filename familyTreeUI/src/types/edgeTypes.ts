import type { Edge, EdgeTypes, BuiltInEdge } from "@xyflow/react";
import { LabeledEdge } from "./Components/Edges/LabeledEdge";

export const edgeTypes = {
  "labeled-edge": LabeledEdge,
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
