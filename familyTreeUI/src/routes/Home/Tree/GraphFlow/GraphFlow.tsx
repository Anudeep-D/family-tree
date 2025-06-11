import { AppEdge, edgeTypes } from "@/types/edgeTypes";
import { AppNode, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { Box } from "@mui/material";
import {
  useNodesState,
  useEdgesState,
  OnConnect,
  addEdge,
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { FC, useCallback, useRef, useState } from "react";
import { NodeButtons } from "./Options/NodeButtons";
import { CoreButtons } from "./Options/CoreButtons";

import "./GraphFlow.scss";
import ConfirmDialog, { ConfirmProps } from "@/routes/common/ConfirmDialog";
import { Project } from "@/types/entityTypes";


type GraphFlowProps = {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  project: Project;
};

const GraphFlow: FC<GraphFlowProps> = ({
  initialNodes,
  initialEdges,
  project,
}) => {
  //ConfirmDialog related
  const [dialogOpen, setDialogOpen] = useState<ConfirmProps>({ open: false });
  const handleConfirmation = () => {
    console.log(dialogOpen);
  };
  const { nodes: initNodes, edges: initEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const addNode = (node: AppNode) => {
    setNodes([...nodes, node]);
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current!.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const newNode: AppNode = {
        id: `${type}-${Date.now()}-new`,
        type,
        position,
        data: { label: `${type} Node` },
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <Box display="flex" height="85vh" width="100vw">
      <Box
        ref={reactFlowWrapper}
        sx={{ flex: 1 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
          <NodeButtons addNode={addNode} />
          <CoreButtons project={project} setDialogOpen={setDialogOpen} />
        </ReactFlow>
      </Box>
      <ConfirmDialog
        onClose={() => setDialogOpen({ open: false })}
        onConfirm={handleConfirmation}
        {...dialogOpen}
      />
    </Box>
  );
};

export default function FlowCanvas(props: GraphFlowProps) {
  return (
    <ReactFlowProvider>
      <GraphFlow {...props} />
    </ReactFlowProvider>
  );
}
