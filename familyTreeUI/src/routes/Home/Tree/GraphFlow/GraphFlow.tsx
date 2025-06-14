import { AppEdge, Edges, edgeTypes } from "@/types/edgeTypes";
import { AppNode, Nodes, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { Alert, Box } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import { useDeleteTreeMutation } from "@/redux/queries/tree-endpoints";
import { NodeButtons } from "./Options/NodeButtons";
import { CoreButtons } from "./Options/CoreButtons";

import "./GraphFlow.scss";
import { Tree } from "@/types/entityTypes";
import { EdgeDialog } from "./EdgeDialog/EdgeDialog";
import { Role } from "@/types/common";

type GraphFlowProps = {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  tree: Tree;
};

const GraphFlow: FC<GraphFlowProps> = ({
  initialNodes,
  initialEdges,
  tree,
}) => {
  const isViewer = tree.access === Role.Viewer;
  const [deleteTree, { isLoading: isDeleting, error: deleteError }] = useDeleteTreeMutation();
  const navigate = useNavigate();
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
  const handleDelete = async () => {
    if (!tree || !tree.elementId) {
        console.error("Tree ID not available for deletion.");
        // Displaying error via Alert below, using deleteError state
        return;
    }
    try {
        await deleteTree(tree.elementId).unwrap();
        console.log("Tree deleted successfully:", tree.elementId);
        navigate("/"); // Redirect to home page
    } catch (err) {
        console.error("Failed to delete tree:", err);
        // Error will be caught and displayed by the Alert component via deleteError state
    }
  };
  return (
    <Box display="flex" flexDirection="column" height="85vh" width="100vw">
      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to delete tree. Error: {JSON.stringify(deleteError)}
        </Alert>
      )}
      {isDeleting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Deleting
        </Alert>
      )}
      <Box
        ref={reactFlowWrapper}
        sx={{ flex: 1 }}
        onDrop={isViewer ? undefined : onDrop} // Conditionally disable drop if viewer
        onDragOver={isViewer ? undefined : onDragOver} // Conditionally disable dragOver if viewer
      >
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={isViewer ? undefined : onConnect}
          onNodeClick={isViewer ? undefined : (_event, node) => {
            console.log("show node's extra info",node);
          }}
          onNodeDoubleClick={isViewer ? undefined : (_event, node) => {
            setEditingNode(node);
            setNodeDialogMode("edit");
          }}
          onNodeContextMenu={isViewer ? undefined : (_event, node) => {
            console.log("show node's context info",node);
          }}
          onEdgeClick={isViewer ? undefined : (_event, edge) => {
            console.log("show edge's extra info",edge);
          }}
          onEdgeDoubleClick={isViewer ? undefined : (_event, edge) => {
            setEditingEdge(edge);
            setEdgeDialogMode("edit");
          }}
          onEdgeContextMenu={isViewer ? undefined : (_event, edge) => {
            console.log("show edge's context info",edge);
          }}
          fitView
          nodesDraggable={!isViewer}
          nodesConnectable={!isViewer}
          nodesFocusable={!isViewer}
          edgesFocusable={!isViewer}
          zoomOnDoubleClick={!isViewer}
          zoomOnScroll={!isViewer}
          panOnDrag={!isViewer}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <MiniMap />
          <Controls />
          {!isViewer && (
            <NodeButtons
              onClose={onNodeDialogClose}
              onSubmit={onNodeDialogSubmit}
              dialogMode={nodeDialogMode}
              editingNode={editingNode}
              pendingNodeDrop={pendingNodeDrop}
              treeId={tree.elementId!} // Pass tree.id as treeId
            />
          )}
          <CoreButtons
            tree={tree}
            handleReset={handleReset}
            handleSave={handleSave}
            handleDelete={handleDelete}
            disabled={isDeleting}
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
