import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./HouseNode.scss";
import { NodeDataMap } from "@/types/nodeTypes";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

export type HouseNode = Node<NodeDataMap["House"], "House">;

const HouseNode = ({ data }: NodeProps<HouseNode>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? "house-popover" : undefined;

  return (
    <div className="house-node house-node-hoverable">
      <strong>{data.name}</strong>

      {data.homeTown && (
        <IconButton
          aria-describedby={popoverId}
          size="small"
          onClick={handlePopoverOpen}
          sx={{
            position: "absolute",
            top: 2, // Adjust as needed
            right: 2, // Adjust as needed
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: for better visibility
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)", // Optional: for better visibility
            },
          }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      )}
      <Popover
        id={popoverId}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography sx={{ p: 2 }}>🏡 {data.homeTown}</Typography>
      </Popover>

      <Handle id="l1" type="target" position={Position.Left} />
      <Handle id="r1" type="source" position={Position.Right} />
      <Handle id="t1" type="target" position={Position.Top} />
      <Handle id="b1" type="source" position={Position.Bottom} />
    </div>
  );
};

export default HouseNode;
