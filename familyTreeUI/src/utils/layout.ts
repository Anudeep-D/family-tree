import dagre from "dagre";
import { AppEdge } from "@/types/edgeTypes";
import { AppNode } from "@/types/nodeTypes";
import { Position } from "@xyflow/react";

const nodeWidth = 250;
const nodeHeight = 250;

export function getLayoutedElements(
  nodes: AppNode[],
  edges: AppEdge[],
  direction: "TB" | "LR" = "TB"
): { nodes: AppNode[]; edges: AppEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Add all nodes to the dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add all edges to the dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply the layout
  dagre.layout(dagreGraph);

  // Update node positions
  const updatedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === "TB" ? Position.Top : Position.Left,
      sourcePosition: direction === "TB" ? Position.Bottom : Position.Right,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  // Add handle IDs to edges
  const updatedEdges = edges.map((edge) => ({
    ...edge,
    sourceHandle: direction === "TB" ? "b1" : "r1",
    targetHandle: direction === "TB" ? "t1" : "l1",
  }));

  return { nodes: updatedNodes, edges: updatedEdges };
}
