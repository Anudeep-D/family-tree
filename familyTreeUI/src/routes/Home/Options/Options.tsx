import { AppNode, nodeTypes } from "@/types/nodeTypes";
import { Box, Button } from "@mui/material";

import "./Options.scss";
type OptionsProps = {
  addNode: (nodes: AppNode) => void;
};
export const Options: React.FC<OptionsProps> = ({ addNode }) => {
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
        <Button
          variant="contained"
          size="small"
          key={type}
          draggable
          onDragStart={(event) => onDragStart(event, type)}
        >
          {type} Node
        </Button>
      ))}
    </Box>
  );
};
