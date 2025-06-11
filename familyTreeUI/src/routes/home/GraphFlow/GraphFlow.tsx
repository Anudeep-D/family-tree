import { AppEdge, edgeTypes } from "@/types/edgeTypes";
import { AppNode, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { Box, Button } from "@mui/material";
import { SaveTwoTone, Restore, DeleteTwoTone } from "@mui/icons-material";
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
import { Options } from "../Options/Options";

import "./GraphFlow.scss";
import ConfirmDialog, {
  ConfirmDialogProps,
} from "@/routes/common/ConfirmDialog";
import { Project } from "@/types/entityTypes";

type GraphFlowProps = {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  project: Project;
};
type ConfirmProps = Pick<
  ConfirmDialogProps,
  "open" | "title" | "message" | "type" | "action"
>;

const GraphFlow: FC<GraphFlowProps> = ({ initialNodes, initialEdges, project }) => {
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
          <Options addNode={addNode} />
          <Box className="flow-save-buttons">
            <Button
              size="small"
              variant="text"
              onClick={() =>
                setDialogOpen({
                  open: true,
                  type: "error",
                  action: "Delete",
                  title: `Delete project ${project.elementId}`,
                  message:
                    "Are you sure you want to delete this project? This action cannot be undone.",
                })
              }
            >
              <DeleteTwoTone fontSize="small" color="error" />
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() =>
                setDialogOpen({
                  open: true,
                  type:"warning",
                  action: "Reset",
                  title: `Reset project ${project.name}`,
                  message:
                    "Are you sure you want to reset this project to original? This action cannot be undone.",
                })
              }
            >
              <Restore fontSize="small" color="action" />
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() =>
                setDialogOpen({
                  open: true,
                  type:"primary",
                  action: "Save",
                  title: `Save project ${project.elementId}`,
                  message:
                    "Are you sure you want to save this project?",
                })
              }
            >
              <SaveTwoTone fontSize="small" color="primary" />
            </Button>
          </Box>
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
