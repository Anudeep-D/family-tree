import { AppEdge, Edges, edgeTypes } from "@/types/edgeTypes";
import { AppNode, Nodes, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { useUpdateGraphMutation } from "@/redux/queries/graph-endpoints"; // Path verified by ls
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
  MarkerType, // Added MarkerType
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
import { getDiff } from "@/utils/common";

// Define defaultMarker outside the component if it's static, or inside if it depends on props/theme
const defaultMarker = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#555' };

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
  const [updateGraph, { isLoading: isSaving, error: saveError }] = useUpdateGraphMutation(); // Initialize mutation hook
  const navigate = useNavigate();

  // Process initialEdges to add markers and classNames
  const edgesWithMarkers = initialEdges.map(edge => ({
    ...edge,
    markerEnd: defaultMarker,
    // Assuming Edges.BelongsTo is the correct enum member or string literal for the type
    ...(edge.type === Edges.BELONGS_TO && { className: 'belongs-to-edge' }), 
  }));

  const { nodes: initNodes, edges: initEdgesWithMarkers } = getLayoutedElements(
    initialNodes,
    edgesWithMarkers // Use the processed edges
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  // Initialize useEdgesState with edges that have markers and classNames
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdgesWithMarkers); 
  
  const [prevNodes, setPrevNodes] = useState<AppNode[]>(initNodes);
  // Initialize prevEdges with edges that have markers and classNames
  const [prevEdges, setPrevEdges] = useState<AppEdge[]>(initEdgesWithMarkers); 
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();

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

    const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log(connection);
      setNewEdge({ 
        id: `${Date.now()}-new-pending`, // Temporary ID for the pending edge
        ...connection, 
        markerEnd: defaultMarker // Add default marker to the edge being templated
      });
      setEdgeDialogMode("new");
    },
    // defaultMarker is a const, not reactive. Add other state setters if they are used directly.
    [setNewEdge, setEdgeDialogMode] 
  );

  const onEdgeDialogClose = () => {
    setEdgeDialogMode(undefined);
    setEditingEdge(undefined);
    setNewEdge(undefined);
  };

  const handleEdgeSubmit = (type: Edges, data: Record<string, string>) => {
    let currentEdge: AppEdge;
    if (edgeDialogMode === "edit") {
      // editingEdge is the state holding the edge being edited
      if (!editingEdge) return; // Should not happen if dialog is in edit mode

      currentEdge = {
        ...editingEdge, // Spread existing properties like id, source, target
        type: type,    // Update type from dialog
        data: {
          ...editingEdge.data,
          ...data,
        },
        markerEnd: defaultMarker, // Ensure marker is present/updated
        // Update className based on the potentially changed type
        className: type === Edges.BELONGS_TO ? 'belongs-to-edge' : '', 
      };
      setEdges((eds) =>
        eds.map((edge) => (edge.id === currentEdge.id ? currentEdge : edge))
      );
    } else if (edgeDialogMode === "new") { 
      // newEdge is the state holding the connection info from onConnect
      if (!newEdge) return; // Should not happen

      currentEdge = {
        ...newEdge, // Spread connection (source, target, sourceHandle, targetHandle) and existing markerEnd
        type: type,  // Set type from dialog
        // Generate a more robust ID for the new edge
        id: `${type}-${newEdge.sourceHandle}-${newEdge.targetHandle}-${Date.now()}`, 
        data: { ...newEdge.data, ...data }, // Add data from dialog
        // Ensure markerEnd is there (it should be from newEdge set in onConnect)
        markerEnd: newEdge.markerEnd || defaultMarker, 
        className: type === Edges.BELONGS_TO ? 'belongs-to-edge' : '',
      };
      setEdges((eds) => addEdge(currentEdge, eds)); // Use addEdge utility
    }
    onEdgeDialogClose();
  };
  
  //Core actions
  const handleReset = () => {
    setEdges(prevEdges);
    setNodes(prevNodes);
  };
  const handleSave = async () => {
    if (!tree || !tree.elementId) {
      console.error("Tree ID not available for saving.");
      // Consider setting a state to show an error message to the user
      return;
    }

    const nodeDiff = getDiff(prevNodes, nodes);
    const edgeDiff = getDiff(prevEdges, edges);

    const diffPayload = {
      addedNodes: nodeDiff.added,
      updatedNodes: nodeDiff.updated,
      deletedNodeIds: nodeDiff.removed.map(n => n.id),
      addedEdges: edgeDiff.added,
      updatedEdges: edgeDiff.updated,
      deletedEdgeIds: edgeDiff.removed.map(e => e.id),
    };

    // Optional: Check if there are any changes before calling the API
    const hasChanges = diffPayload.addedNodes?.length || 
                       diffPayload.updatedNodes?.length || 
                       diffPayload.deletedNodeIds?.length || 
                       diffPayload.addedEdges?.length || 
                       diffPayload.updatedEdges?.length || 
                       diffPayload.deletedEdgeIds?.length;

    if (!hasChanges) {
      console.log("No changes to save.");
      // Optionally, inform the user that there are no changes.
      return;
    }

    console.log("Saving graph with diff:", diffPayload);

    try {
      await updateGraph({ treeId: tree.elementId, diff: diffPayload }).unwrap();
      setPrevNodes(nodes); // Update the baseline for future diffs
      setPrevEdges(edges); // Update the baseline for future diffs
      console.log("Graph saved successfully!");
      // Optionally, trigger a success toast/notification
    } catch (err) {
      console.error("Failed to save graph:", err);
      // The `saveError` variable from the hook will also be populated.
      // Optionally, trigger an error toast/notification
    }
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
      {saveError && ( // Display save error
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to save tree changes. Error: {JSON.stringify(saveError)}
        </Alert>
      )}
      {isDeleting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Deleting tree...
        </Alert>
      )}
      {isSaving && ( // Display saving indicator
        <Alert severity="info" sx={{ mb: 2 }}>
            Saving changes...
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
            disabled={isDeleting || isSaving} // Update disabled state
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
