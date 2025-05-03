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
import { edgeTypes, initialEdges } from "./graph/components/edges";
import { initialNodes, nodeTypes } from "./graph/components/nodes";
import { useCallback } from "react";
import "@xyflow/react/dist/style.css";
const Home = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
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
