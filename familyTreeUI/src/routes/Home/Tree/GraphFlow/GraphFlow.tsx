import { AppEdge, edgeTypes } from "@/types/edgeTypes";
import { AppNode, Nodes, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { Box } from "@mui/material";
import {
  useNodesState,
  useEdgesState,
  OnConnect,
  addEdge,
  addNode,
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  XYPosition,
} from "@xyflow/react";
import { FC, useCallback, useRef, useState } from "react";
import { NodeButtons } from "./Options/NodeButtons";
import { CoreButtons } from "./Options/CoreButtons";

import "./GraphFlow.scss";
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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData("application/reactflow");

      if (!raw) return;
      const { type } = JSON.parse(raw);
      const bounds = reactFlowWrapper.current!.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      setPendingNodeDrop({ type, position });
      setDialogMode("new");
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  //Node Dialog related
  const [dialogMode, setDialogMode] = useState<"new" | "edit" | undefined>(
    undefined
  );
  const [editingNode, setEditingNode] = useState<AppNode | undefined>(
    undefined
  );
  const [pendingNodeDrop, setPendingNodeDrop] = useState<
    | {
        type: Nodes;
        position: XYPosition;
      }
    | undefined
  >(undefined);

  const onNodeDialogClose = () => {
    setEditingNode(undefined);
    setPendingNodeDrop(undefined);
    setDialogMode(undefined);
  };

  const onNodeDialogSubmit = (curNode: AppNode) => {
    if (dialogMode === "edit") {
      setNodes((nds) =>
        nds.map((node) => (node.id === editingNode?.id ? curNode : node))
      );
    } else if (dialogMode === "new") {
      setEdges((nds) => addNode(curNode, nds)); 
    }
    onNodeDialogClose();
  };
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
          onNodeDoubleClick={(_event, node) => {
            setEditingNode(node);
            setDialogMode("edit");
          }}
          onEdgeDoubleClick={(_event, edge) => {
            console.log("edge clicked", edge);
          }}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
          <NodeButtons
            onClose={onNodeDialogClose}
            onSubmit={onNodeDialogSubmit}
            dialogMode={dialogMode}
            editingNode={editingNode}
            pendingNodeDrop={pendingNodeDrop}
          />
          <CoreButtons project={project} />
        </ReactFlow>
      </Box>
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
