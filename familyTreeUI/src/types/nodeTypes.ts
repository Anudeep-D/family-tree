import type { Node, NodeTypes, BuiltInNode } from '@xyflow/react';
import { PositionLoggerNode } from './Components/Nodes/PositionLoggerNode';

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;


export type BaseNode = Node<
  {
    // e.g., 'Person', 'House', etc.
    label?: string;
    data?: Record<string, any>;
    position?: [number, number]; // optional
  },
  string
>;

export type AppNode = BuiltInNode | BaseNode;