// utils/layout.ts
import dagre from 'dagre';
import { AppEdge } from "@/types/edgeTypes";
import { AppNode } from "@/types/nodeTypes";
import { Position } from '@xyflow/react';

const nodeWidth = 250;
const nodeHeight = 250;

export function getLayoutedElements(
  nodes: AppNode[],
  edges: AppEdge[],
  direction: 'TB' | 'LR' = 'TB' // TB = top-bottom (good for trees)
): { nodes: AppNode[]; edges: AppEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const updatedNodes = nodes.map((node) => {
  const nodeWithPosition = dagreGraph.node(node.id);

  return {
    ...node,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
    position: {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    },
  };
});

  return { nodes:updatedNodes, edges };
}
