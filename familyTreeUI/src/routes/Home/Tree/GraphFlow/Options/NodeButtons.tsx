import { AppNode, nodeTypes, NodeTypeKey } from "@/types/nodeTypes";
import { Box, IconButton, Tooltip } from "@mui/material";

import "./NodeButtons.scss";
import { Diversity3TwoTone, Person2TwoTone } from "@mui/icons-material";
import { ReactNode } from "react";


const typeToIcon: Record<NodeTypeKey, ReactNode> = {
  Person: <Person2TwoTone fontSize="large" color="primary" />,
  House: <Diversity3TwoTone fontSize="large" color="success" />,
};
type NodeButtonsProps = {
  addNode: (nodes: AppNode) => void;
};
export const NodeButtons: React.FC<NodeButtonsProps> = ({ addNode }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
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
          <Tooltip title={`Drag to add a new ${type} node to the canvas`}>
            <IconButton
              aria-label="delete"
              size="small"
              key={type}
              draggable
              onDragStart={(event) => onDragStart(event, type)}
            >
              {typeToIcon[type as NodeTypeKey]}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
  );
};
