import { AppEdge, edgeTypes } from "@/types/edgeTypes";
import { AppNode, nodeTypes } from "@/types/nodeTypes";
import {
  useNodesState,
  useEdgesState,
  OnConnect,
  addEdge,
  ReactFlow,
  Background,
  MiniMap,
  Controls,
} from "@xyflow/react";
import { FC, useCallback } from "react";
type GraphFlowProps = {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
};
export const GraphFlow: FC<GraphFlowProps> = ({
  initialNodes,
  initialEdges,
}) => {
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
