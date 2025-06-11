import { AppNode, nodeTypes } from "@/types/nodeTypes";
import { Box, Button, Tooltip } from "@mui/material";

import "./NodeButtons.scss";
type NodeButtonsProps = {
  addNode: (nodes: AppNode) => void;
};
export const NodeButtons: React.FC<NodeButtonsProps> = ({ addNode }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Tooltip title="Drag to add node">
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
          <Button
            variant="outlined"
            size="small"
            key={type}
            draggable
            onDragStart={(event) => onDragStart(event, type)}
          >
            {type}
          </Button>
        ))}
      </Box>
    </Tooltip>
  );
};
