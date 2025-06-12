import { AppNode, nodeTypes, Nodes } from "@/types/nodeTypes";
import { Box, IconButton, Tooltip } from "@mui/material";

import "./NodeButtons.scss";
import { Diversity3TwoTone, Person2TwoTone } from "@mui/icons-material";
import { ReactNode } from "react";
import { NodeDialog } from "../NodeDialog/NodeDialog";
import { XYPosition } from "@xyflow/react";

const typeToIcon: Record<Nodes, ReactNode> = {
  [Nodes.Person]: <Person2TwoTone fontSize="large" color="primary" />,
  [Nodes.House]: <Diversity3TwoTone fontSize="large" color="success" />,
};
type NodeButtonsProps = {
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
  onClose,
  onSubmit,
  dialogMode,
  editingNode,
  pendingNodeDrop,
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSubmit = (type: Nodes, data: Record<string, string>) => {
    let currentNode: AppNode | undefined;
    if (dialogMode === "edit") {
      currentNode = {
        ...editingNode!,
        data: {
          ...editingNode!.data,
          ...data,
        },
      };
    }
    if (dialogMode === "new") {
      currentNode = {
        id: `${type}-${Date.now()}-new`,
        type: pendingNodeDrop!.type,
        position: pendingNodeDrop!.position,
        data: data,
      };
    }
    if (currentNode) onSubmit(currentNode);
    else onClose();
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
      {dialogMode && <NodeDialog
        open={Boolean(dialogMode)}
        onClose={onClose}
        mode={dialogMode ? dialogMode : "new"}
        type={
          dialogMode === "edit"
            ? (editingNode?.type as Nodes | undefined)
            : pendingNodeDrop?.type
        }
        initialData={editingNode?.data}
        onSubmit={(type, data) => handleSubmit(type, data)}
      />}
    </Box>
  );
};
