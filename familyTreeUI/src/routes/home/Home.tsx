import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  addEdge,
  OnConnect,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback } from "react";
import "@xyflow/react/dist/style.css";
import { AppNode, nodeTypes } from "@/types/nodeTypes";
import { AppEdge, edgeTypes } from "@/types/edgeTypes";
import { getNodesWithPositions } from "@/utils/nodePositions";
// Sample custom nodes
export const initialNodes: AppNode[] = [
  {
    id: "1",
    type: "position-logger",
    data: { label: "Root Node" },
    position: { x: 100, y: 100 },
  },
  {
    id: "2",
    type: "position-logger",
    data: { label: "Child Node" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "position-logger",
    data: { label: "Sibling Node" },
    position: { x: 100, y: 100 },
  },
];

// Sample custom edges
export const initialEdges: AppEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    sourceHandle: "b",
    targetHandle: "a",
    type: "labeled-edge",
    data: { label: "PARENT_OF" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    sourceHandle: "b",
    targetHandle: "a",
    type: "labeled-edge",
    data: { label: "PARENT_OF" },
  }
];
const Home = () => {
  const [nodes, ,onNodesChange] = useNodesState(getNodesWithPositions(initialNodes, initialEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
};

export default Home;
