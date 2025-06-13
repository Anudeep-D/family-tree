import { AppEdge, Edges, edgeTypes } from "@/types/edgeTypes";
import { AppNode, Nodes, nodeTypes } from "@/types/nodeTypes";
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
  XYPosition,
} from "@xyflow/react";
import { FC, useCallback, useRef, useState } from "react";
import { NodeButtons } from "./Options/NodeButtons";
import { CoreButtons } from "./Options/CoreButtons";

import "./GraphFlow.scss";
import { Project } from "@/types/entityTypes";
import { EdgeDialog } from "./EdgeDialog/EdgeDialog";

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
  const [prevNodes, setPrevNodes] = useState<AppNode[]>(initNodes);
  const [prevEdges, setPrevEdges] = useState<AppEdge[]>(initEdges);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log(connection);
      setNewEdge({ id: `${Date.now()}-new`, ...connection });
      setEdgeDialogMode("new");
    },
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
      setNodeDialogMode("new");
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  //Node Dialog related
  const [nodeDialogMode, setNodeDialogMode] = useState<
    "new" | "edit" | undefined
  >(undefined);
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
    setNodeDialogMode(undefined);
  };

  const onNodeDialogSubmit = (curNode: AppNode) => {
    if (nodeDialogMode === "edit") {
      setNodes((nds) =>
        nds.map((node) => (node.id === curNode?.id ? curNode : node))
      );
    } else if (nodeDialogMode === "new") {
      setNodes((nds) => nds.concat(curNode));
    }
    onNodeDialogClose();
  };

  //Edge Dialog related
  const [edgeDialogMode, setEdgeDialogMode] = useState<
    "new" | "edit" | undefined
  >(undefined);
  const [editingEdge, setEditingEdge] = useState<AppEdge | undefined>(
    undefined
  );
  const [newEdge, setNewEdge] = useState<AppEdge | undefined>(undefined);

  const onEdgeDialogClose = () => {
    setEdgeDialogMode(undefined);
    setEditingEdge(undefined);
    setNewEdge(undefined);
  };

  const handleEdgeSubmit = (type: Edges, data: Record<string, string>) => {
    if (edgeDialogMode === "edit") {
      const currentEdge: AppEdge = {
        ...editingEdge!,
        type: type,
        data: {
          ...editingEdge!.data,
          ...data,
        },
      };
      setEdges((eds) =>
        eds.map((edge) => (edge.id === currentEdge?.id ? currentEdge : edge))
      );
    }
    if (edgeDialogMode === "new") {
      console.log(newEdge);
      const currentEdge: AppEdge = newEdge!;
      currentEdge.type = type;
      currentEdge.id = `${newEdge!.type}-${Date.now()}-new`;
      currentEdge.data = { ...newEdge!.data, ...data };
      setEdges((eds) => addEdge(currentEdge!, eds));
    }
    onEdgeDialogClose();
  };

  //Core actions
  const handleReset = () => {
    setEdges(prevEdges);
    setNodes(prevNodes);
  };
  const handleSave = () => {
    console.log("save");
  };
  const handleDelete = () => {
    console.log("delete");
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
          onNodeClick={(_event, node) => {
            console.log("show node's extra info",node);
          }}
          onNodeDoubleClick={(_event, node) => {
            setEditingNode(node);
            setNodeDialogMode("edit");
          }}
          onNodeContextMenu={(_event, node) => {
            console.log("show node's context info",node);
          }}
          onEdgeClick={(_event, edge) => {
            console.log("show edge's extra info",edge);
          }}
          onEdgeDoubleClick={(_event, edge) => {
            setEditingEdge(edge);
            setEdgeDialogMode("edit");
          }}
          onEdgeContextMenu={(_event, edge) => {
            console.log("show edge's context info",edge);
          }}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
          <NodeButtons
            onClose={onNodeDialogClose}
            onSubmit={onNodeDialogSubmit}
            dialogMode={nodeDialogMode}
            editingNode={editingNode}
            pendingNodeDrop={pendingNodeDrop}
            projectId={project.elementId!} // Pass project.id as projectId
          />
          <CoreButtons
            project={project}
            handleReset={handleReset}
            handleSave={handleSave}
            handleDelete={handleDelete}
          />
        </ReactFlow>
      </Box>
      {edgeDialogMode && (
        <EdgeDialog
          open={Boolean(edgeDialogMode)}
          onClose={onEdgeDialogClose}
          mode={edgeDialogMode ? edgeDialogMode : "new"}
          type={
            edgeDialogMode === "edit"
              ? (editingEdge?.type as Edges | undefined)
              : undefined
          }
          initialData={editingEdge?.data}
          onSubmit={(type, data) => handleEdgeSubmit(type, data)}
        />
      )}
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
