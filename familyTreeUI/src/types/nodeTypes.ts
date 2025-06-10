import type { Node, NodeTypes, BuiltInNode, Position } from '@xyflow/react';
import { PositionLoggerNode } from './Components/Nodes/PositionLoggerNode';
import PersonNode from './Components/Nodes/PersonNode';
import HouseNode from './Components/Nodes/HouseNode';

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  'Person': PersonNode,
  'House': HouseNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;


export type BaseNode = Node<
  {
    // e.g., 'Person', 'House', etc.
    label?: string;
    data?: Record<string, any>;
    position?: [number, number]; // optional
    sourcePosition? : Position;
    targetPosition? : Position;
  },
  string
>;

export type AppNode = BuiltInNode | BaseNode;