import type { EdgeTypes, MarkerType } from "@xyflow/react";
import MarriageEdge from "./Components/Edges/MarriageEdge";
import ParentEdge from "./Components/Edges/ParentEdge";
import BelongsEdge from "./Components/Edges/BelongsEdge";
import { FromFieldList } from "./common";
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
  readonly isField: boolean;
};

export const edgeFieldTemplates = {
  [Edges.MARRIED_TO]: [
    {
      name: "dateOfMarriage",
      label: "Date of Marriage",
      type: "date",
      required: false,
      default: undefined,
      isField: true,
    },
    {
      name: "location",
      label: "Location",
      type: "string",
      required: false,
      default: "",
      isField: true,
    },
    {
      name: "status",
      label: "Status",
      type: ["married", "divorced", "separated"],
      required: false,
      default: "married",
      isField: true,
    },
    {
      name: "updatedOn",
      label: "Updated On",
      type: "date",
      required: false,
      default: undefined,
      isField: false,
    },
  ],
  [Edges.PARENT_OF]: [
    {
      name: "updatedOn",
      label: "Updated On",
      type: "date",
      required: false,
      default: undefined,
      isField: false,
    },
  ],
  [Edges.BELONGS_TO]: [
    {
      name: "updatedOn",
      label: "Updated On",
      type: "date",
      required: false,
      default: undefined,
      isField: false,
    },
  ],
} as const;

export type EdgeDataMap = {
  [Edges.BELONGS_TO]: FromFieldList<
    (typeof edgeFieldTemplates)[Edges.BELONGS_TO]
  >;
  [Edges.PARENT_OF]: FromFieldList<
    (typeof edgeFieldTemplates)[Edges.PARENT_OF]
  >;
  [Edges.MARRIED_TO]: FromFieldList<
    (typeof edgeFieldTemplates)[Edges.MARRIED_TO]
  >;
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
  className?: string;
  markerEnd?: {
    type: MarkerType;
    width: number;
    height: number;
    color: string;
  };
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: Record<string, any>;
};
