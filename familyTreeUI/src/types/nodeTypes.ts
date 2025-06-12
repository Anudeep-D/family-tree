import type { Node, NodeTypes, BuiltInNode, Position, XYPosition } from "@xyflow/react";
import PersonNode from "./Components/Nodes/PersonNode";
import HouseNode from "./Components/Nodes/HouseNode";
export enum Nodes {
  Person = "Person",
  House = "House",
}

export const nodeFieldTemplates = {
  [Nodes.Person]: {
    name: "",
    label: "",
    isAlive: "",
    nickName: "",
    gender: "",
    character: "",
  },
  [Nodes.House]: {
    name: "",
    sigil: "",
    words: "",
    nickName: "",
    hometown: "",
    gods: "",
  },
} as const;

export type NodeDataMap = {
  [K in Nodes]: (typeof nodeFieldTemplates)[K];
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
