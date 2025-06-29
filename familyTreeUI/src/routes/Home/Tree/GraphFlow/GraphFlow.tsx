import { AppEdge, Edges, edgeTypes } from "@/types/edgeTypes";
import { AppNode, Nodes, nodeTypes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import {
  useUpdateGraphMutation,
} from "@/redux/queries/graph-endpoints"; // Path verified by ls
import {
  Alert,
  Box,
  Snackbar,
} from "@mui/material";
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
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteTreeMutation } from "@/redux/queries/tree-endpoints";
import { NodeButtons } from "./Options/NodeButtons";
import { CoreButtons } from "./Options/CoreButtons";

import "./GraphFlow.scss";
import { Tree } from "@/types/entityTypes";
import { EdgeDialog } from "./EdgeDialog/EdgeDialog";
import { Role } from "@/types/common";
import { getDiff, isDiff } from "@/utils/common";
import {
  setReduxNodes,
  setReduxEdges,
  selectFilteredNodes,
  selectFilteredEdges,
  setApplyFilters,
  selectCurrentFilter,
  selectGraphChanged,
  setGraphChanged,
  selectEdges,
  selectNodes,
} from "@/redux/treeConfigSlice";
import { useDispatch, useSelector } from "react-redux";

// Define defaultMarker outside the component if it's static, or inside if it depends on props/theme
const defaultMarker = {
  type: MarkerType.Arrow,
  width: 15,
  height: 15,
  color: "#cb4e4e",
};

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
  const dispatch = useDispatch(); // Initialize useDispatch
  const [snackBarMsg, setSnackBarMsg] = useState<ReactNode | undefined>(
    undefined
  );
  const isViewer = tree.access === Role.Viewer;
  const [deleteTree, { isLoading: isDeleting, error: deleteError }] =
    useDeleteTreeMutation();
  const [updateGraph, { isLoading: isSaving, error: saveError }] =
    useUpdateGraphMutation(); // Initialize mutation hook
  const navigate = useNavigate();

  // Process initialEdges to add markers and classNames
  const edgesWithMarkers = initialEdges.map((edge) => ({
    ...edge,
    markerEnd: defaultMarker,
    // Assuming Edges.BelongsTo is the correct enum member or string literal for the type
    className: `${edge.type!}-edge`,
  }));

  const { nodes: initNodes, edges: initEdgesWithMarkers } = getLayoutedElements(
    initialNodes,
    edgesWithMarkers // Use the processed edges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  // Initialize useEdgesState with edges that have markers and classNames
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdgesWithMarkers);
  const currentFilter = useSelector(selectCurrentFilter);
  const graphChanged = useSelector(selectGraphChanged);

  const handleApplyFilter = () => {
    dispatch(setApplyFilters());
  };

  const oldNodes = useSelector(selectNodes);
  const oldEdges = useSelector(selectEdges);
  useEffect(() => {
    dispatch(setGraphChanged(isDiff(oldNodes,nodes, oldEdges,edges)));
    nodes && dispatch(setReduxNodes(nodes));
    edges && dispatch(setReduxEdges(edges));
    handleApplyFilter();
  }, [dispatch, nodes, edges]);

  const filteredNodes = useSelector(selectFilteredNodes);
  const filteredEdges = useSelector(selectFilteredEdges);

  useEffect(() => {
    currentFilter.enabled && graphChanged && setSnackBarMsg(
      <Box>
        <strong>Filters applied!</strong> Displaying a filtered tree.
      </Box>
    );
  }, [filteredEdges, filteredNodes]);
  const [prevNodes, setPrevNodes] = useNodesState(initNodes);
  // Initialize prevEdges with edges that have markers and classNames
  const [prevEdges, setPrevEdges] = useEdgesState(initEdgesWithMarkers);
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

  const onNodeDialogSubmit = (curNode: AppNode, edgeChanges?: { added: AppEdge[]; removed: { id: string }[] }) => {
    if (nodeDialogMode === "edit") {
      setNodes((nds) =>
        nds.map((node) => (node.id === curNode?.id ? curNode : node))
      );
    } else if (nodeDialogMode === "new") {
      setNodes((nds) => nds.concat(curNode));
    }

    if (edgeChanges) {
      setEdges((eds) => {
        // Filter out removed edges
        const remainingEdges = eds.filter(edge => !edgeChanges.removed.some(removedEdge => removedEdge.id === edge.id));
        // Add new edges
        const updatedEdges = remainingEdges.concat(edgeChanges.added);
        return updatedEdges;
      });
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
  const [involvedNodes, setInvolvedNodes] = useState<
    { source: AppNode; target: AppNode } | undefined
  >(undefined);
  const [newEdge, setNewEdge] = useState<AppEdge | undefined>(undefined);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const edgeSourceNode = nodes.find((nodeS) => nodeS.id === connection.source);
      const edgeTargetNode = nodes.find((nodeT) => nodeT.id === connection.target);

      if (edgeSourceNode && edgeTargetNode) {
        const isSourcePerson = edgeSourceNode.type === Nodes.Person;
        const isTargetPerson = edgeTargetNode.type === Nodes.Person;
        const isSourceHouse = edgeSourceNode.type === Nodes.House;
        const isTargetHouse = edgeTargetNode.type === Nodes.House;

        if ((isSourcePerson && isTargetHouse) || (isSourceHouse && isTargetPerson)) {
          // Determine correct source and target for BELONGS_TO (Person -> House)
          const sourceId = isSourcePerson ? connection.source : connection.target;
          const targetId = isTargetHouse ? connection.target : connection.source;
          // Preserve original handles if possible, adjust if direction is flipped
          const sourceHandle = isSourcePerson ? connection.sourceHandle : connection.targetHandle;
          const targetHandle = isTargetHouse ? connection.targetHandle : connection.sourceHandle;


          const newBelongsToEdge: AppEdge = {
            id: `${Edges.BELONGS_TO}-${sourceId}-${targetId}-${Date.now()}`,
            source: sourceId,
            target: targetId,
            sourceHandle,
            targetHandle,
            type: Edges.BELONGS_TO,
            markerEnd: defaultMarker,
            className: `${Edges.BELONGS_TO}-edge`,
            data: {}, // Add any default data if necessary
          };
          setEdges((eds) => addEdge(newBelongsToEdge, eds));
          // Skip opening the dialog
        } else {
          // Original behavior: open EdgeDialog for other types of connections
          console.log("Opening Edge Dialog for connection:", connection);
          setNewEdge({
            id: `${Date.now()}-new-pending`, // Temporary ID for the pending edge
            ...connection,
            markerEnd: defaultMarker, // Add default marker to the edge being templated
          });
          setInvolvedNodes({ source: edgeSourceNode, target: edgeTargetNode });
          setEdgeDialogMode("new");
        }
      }
    },
    [nodes, setEdges, setNewEdge, setInvolvedNodes, setEdgeDialogMode] // Ensure all dependencies are listed
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
        type: type, // Update type from dialog
        data: {
          ...editingEdge.data,
          ...data,
        },
        markerEnd: defaultMarker, // Ensure marker is present/updated
        // Update className based on the potentially changed type
        className: `${type}-edge`,
      };
      setEdges((eds) =>
        eds.map((edge) => (edge.id === currentEdge.id ? currentEdge : edge))
      );
    } else if (edgeDialogMode === "new") {
      // newEdge is the state holding the connection info from onConnect
      if (!newEdge) return; // Should not happen

      currentEdge = {
        ...newEdge, // Spread connection (source, target, sourceHandle, targetHandle) and existing markerEnd
        type: type, // Set type from dialog
        // Generate a more robust ID for the new edge
        id: `${type}-${newEdge.sourceHandle}-${
          newEdge.targetHandle
        }-${Date.now()}`,
        data: { ...newEdge.data, ...data }, // Add data from dialog
        // Ensure markerEnd is there (it should be from newEdge set in onConnect)
        markerEnd: newEdge.markerEnd || defaultMarker,
        className: `${type}-edge`,
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
      deletedNodeIds: nodeDiff.removed.map((n) => n.id),
      addedEdges: edgeDiff.added,
      updatedEdges: edgeDiff.updated,
      deletedEdgeIds: edgeDiff.removed.map((e) => e.id),
    };

    // Optional: Check if there are any changes before calling the API
    const hasChanges =
      diffPayload.addedNodes?.length ||
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

  // Options
  // Sort
  const sortTree = () => {
    const { nodes: sortedNodes, edges: sortedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes(sortedNodes);
    setEdges(sortedEdges);
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
          nodes={filteredNodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={filteredEdges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={isViewer ? undefined : onConnect}
          onNodeClick={
            isViewer
              ? undefined
              : (_event, node) => {
                  console.log("show node's extra info", node);
                }
          }
          onNodeDoubleClick={
            isViewer
              ? undefined
              : (_event, node) => {
                  setEditingNode(node);
                  setNodeDialogMode("edit");
                }
          }
          onNodeContextMenu={
            isViewer
              ? undefined
              : (_event, node) => {
                  console.log("show node's context info", node);
                }
          }
          onEdgeClick={
            isViewer
              ? undefined
              : (_event, edge) => {
                  console.log("show edge's extra info", edge);
                }
          }
          onEdgeDoubleClick={
            isViewer
              ? undefined
              : (_event, edge) => {
                  const edgeSource = nodes.find(
                    (node) => node.id === edge.source
                  );
                  const edgeTarget = nodes.find(
                    (node) => node.id === edge.target
                  );
                  edgeSource &&
                    edgeTarget &&
                    setInvolvedNodes({
                      source: edgeSource,
                      target: edgeTarget,
                    });
                  setEditingEdge(edge);
                  setEdgeDialogMode("edit");
                }
          }
          onEdgeContextMenu={
            isViewer
              ? undefined
              : (_event, edge) => {
                  console.log("show edge's context info", edge);
                }
          }
          fitView
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
              nodes={nodes} // NEW: Pass nodes
              edges={edges} // NEW: Pass edges
            />
          )}
          <CoreButtons
            tree={tree}
            handleReset={handleReset}
            handleSave={handleSave}
            handleDelete={handleDelete}
            disabled={isDeleting || isSaving} // Update disabled state
            sortTree={sortTree}
          />
        </ReactFlow>
      </Box>
      {edgeDialogMode && (
        <EdgeDialog
          nodes={involvedNodes}
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

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={Boolean(snackBarMsg)}
        autoHideDuration={6000}
        onClose={() => setSnackBarMsg(undefined)}
      >
        <Alert severity="warning" variant="filled" sx={{ width: "100%" }}>
          {snackBarMsg}
        </Alert>
      </Snackbar>
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
