import type { NodeTypes, Position, XYPosition } from "@xyflow/react";
import PersonNode from "./Components/Nodes/PersonNode";
import HouseNode from "./Components/Nodes/HouseNode";
import { FromFieldList } from "./common";
export enum Nodes {
  Person = "Person",
  House = "House",
}

// Definition for a single field in the metadata
export type NodeFieldDefinition = {
  readonly name: string;
  readonly label: string;
  readonly type: "string" | "date" | "boolean" | readonly string[];
  readonly required: boolean;
  readonly default?: string | boolean | Date | undefined; // Note: readonly string[] for default if type is readonly string[] might be needed if such defaults exist. Currently, 'gender' default is "male" (string).
  readonly isField: boolean;
};

// This type can be used to ensure nodeFieldsMetadata conforms to a structure where each Node type maps to an array of NodeFieldDefinition.
// However, 'as const' provides stronger literal typing for 'type' and 'name' which is beneficial.
// NodeDialog.tsx will use NodeFieldDefinition to type the iterated 'field'.
export const nodeFieldsMetadata = {
  [Nodes.Person]: [
    {
      name: "name",
      type: "string",
      required: true,
      label: "Name",
      default: undefined,
      isField:true,
    },
    {
      name: "nickName",
      type: "string",
      required: false,
      label: "Nick name",
      default: undefined,
      isField:true,
    },
    {
      name: "gender",
      type: ["male", "female"],
      required: true,
      label: "Gender",
      default: "male",
      isField:true,
    },
    {
      name: "dob",
      type: "date",
      required: false,
      label: "Born on",
      default: undefined,
      isField:true,
    },
    {
      name: "currLocation",
      type: "string",
      required: false,
      label: "Current location",
      default: undefined,
      isField:true,
    },
    {
      name: "qualification",
      type: "string",
      required: false,
      label: "Education qualification",
      default: undefined,
      isField:true,
    },
    {
      name: "job",
      type: "string",
      required: false,
      label: "Job",
      default: undefined,
      isField:true,
    },
    {
      name: "isAlive",
      type: ["Yes", "No"],
      required: false,
      label: "Is alive?",
      default: "Yes",
      isField:true,
    },
    {
      name: "doe",
      type: "date",
      required: false,
      label: "Died on",
      default: undefined,
      isField:true,
    },
    {
      name: "imageUrl",
      type: "string",
      required: false,
      label: "Image URL",
      default: undefined,
      isField:false,
    },
    {
      name: "imageUrl",
      type: "string",
      required: false,
      label: "Image URL",
      default: undefined,
      isField:false,
    },
    {
      name: "updatedOn",
      type: "date",
      required: false,
      label: "Updated On",
      default: undefined,
      isField:false,
    }
  ],
  [Nodes.House]: [
    {
      name: "name",
      type: "string",
      required: true,
      label: "Family name",
      default: undefined,
      isField:true,
    },
    {
      name: "homeTown",
      type: "string",
      required: false,
      label: "Origins of this family",
      default: undefined,
      isField:true,
    },
    {
      name: "updatedOn",
      type: "date",
      required: false,
      label: "Updated On",
      default: undefined,
      isField:false,
    }
  ],
} as const;


export type NodeDataMap = {
  [Nodes.Person]: FromFieldList<(typeof nodeFieldsMetadata)[Nodes.Person]>;
  [Nodes.House]: FromFieldList<(typeof nodeFieldsMetadata)[Nodes.House]>;
};

export const nodeTypes = {
  [Nodes.Person]: PersonNode,
  [Nodes.House]: HouseNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;

export type AppNode = {
  id: string;
  type: string;
  data: Record<string, any>;
  position: XYPosition; // optional
  sourcePosition?: Position;
  targetPosition?: Position;
};
