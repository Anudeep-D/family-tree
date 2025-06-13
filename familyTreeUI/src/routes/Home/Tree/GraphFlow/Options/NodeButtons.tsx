import { AppNode, nodeTypes, Nodes, nodeFieldTemplates } from "@/types/nodeTypes";
import { Box, IconButton, Tooltip } from "@mui/material";
// import { v4 as uuidv4 } from 'uuid'; // Removed uuid import
import "./NodeButtons.scss";
import { Diversity3TwoTone, Person2TwoTone } from "@mui/icons-material";
import { ReactNode, useState, useEffect } from "react";
import { NodeDialog } from "../NodeDialog/NodeDialog";
import { XYPosition } from "@xyflow/react";

const typeToIcon: Record<Nodes, ReactNode> = {
  [Nodes.Person]: <Person2TwoTone fontSize="large" color="primary" />,
  [Nodes.House]: <Diversity3TwoTone fontSize="large" color="success" />,
};
type NodeButtonsProps = {
  projectId: string;
  onClose: () => void;
  onSubmit: (node: AppNode) => void;
  dialogMode?: "new" | "edit";
  editingNode?: AppNode;
  pendingNodeDrop?: {
    type: Nodes;
    position: XYPosition;
  };
};
export const NodeButtons: React.FC<NodeButtonsProps> = ({
  projectId,
  onClose,
  onSubmit,
  dialogMode,
  editingNode,
  pendingNodeDrop,
}) => {
  const [internalNewNodeId, setInternalNewNodeId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (dialogMode === 'new' && pendingNodeDrop && !internalNewNodeId) {
      setInternalNewNodeId(crypto.randomUUID()); // Changed to crypto.randomUUID()
    } else if (dialogMode !== 'new' && internalNewNodeId) { // Reset if dialog closes or mode changes
      setInternalNewNodeId(undefined);
    }
  }, [dialogMode, pendingNodeDrop, internalNewNodeId]);


  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  // handleSubmit is called by NodeDialog's onSubmit
  const handleDialogSubmit = (formData: Record<string, any>) => {
    let finalNodeData: AppNode;
    if (dialogMode === 'edit') {
      finalNodeData = {
        ...editingNode!,
        data: { ...editingNode!.data, ...formData }, // Merge, formData might have new imageUrl
      };
    } else { // dialogMode === 'new'
      if (!internalNewNodeId || !pendingNodeDrop) {
        console.error("New node ID or pending drop info is missing.");
        onClose(); // Close dialog to prevent inconsistent state
        return;
      }
      finalNodeData = {
        id: internalNewNodeId!, // Use the generated ID
        type: pendingNodeDrop!.type,
        position: pendingNodeDrop!.position,
        data: formData, // formData from dialog includes all fields + imageUrl
      };
    }
    onSubmit(finalNodeData);
    // Reset internalNewNodeId AFTER successful submission handling by parent (onSubmit)
    // The useEffect will also handle resetting it if dialogMode changes or closes.
    // For explicit reset after 'new' submission:
    if (dialogMode === 'new') {
      setInternalNewNodeId(undefined);
    }
  };

  return (
    <Box
      className="flow-node-buttons"
      sx={{
        position: "absolute",
        top: 20,
        left: 20,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        zIndex: 10,
      }}
    >
      {Object.keys(nodeTypes).map((type) => (
        <Box key={type}>
          <Tooltip title={`Drag to add a new ${type} node to the canvas`}>
            <IconButton
              aria-label="delete"
              size="small"
              key={type}
              draggable
              onDragStart={(event) => onDragStart(event, type)}
            >
              {typeToIcon[type as Nodes]}
            </IconButton>
          </Tooltip>
        </Box>
      ))}
      {dialogMode && (
        <NodeDialog
          open={Boolean(dialogMode)}
          onClose={() => {
            onClose();
            if (dialogMode === 'new') { // Ensure reset if dialog is merely closed
              setInternalNewNodeId(undefined);
            }
          }}
          mode={dialogMode} // dialogMode is already "new" | "edit"
          type={
            dialogMode === "edit"
              ? (editingNode?.type as Nodes | undefined)
              : pendingNodeDrop?.type
          }
          initialData={
            dialogMode === 'edit'
              ? editingNode?.data
              : pendingNodeDrop
              ? { ...nodeFieldTemplates[pendingNodeDrop.type], imageUrl: "" } // Provide default for new, including imageUrl
              : { imageUrl: "" }
          }
          onSubmit={handleDialogSubmit}
          projectId={projectId}
          nodeId={dialogMode === 'edit' ? editingNode!.id : internalNewNodeId!}
        />
      )}
    </Box>
  );
};
