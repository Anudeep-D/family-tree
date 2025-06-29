import { Popover, Typography } from "@mui/material";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";

type HouseNodePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  nodeData: NodeDataMap[Nodes.House] | null;
};

export const HouseNodePopover = ({
  open,
  anchorEl,
  onClose,
  nodeData,
}: HouseNodePopoverProps) => {
  if (!nodeData || !nodeData.homeTown) { // Only render if there's a homeTown
    return null;
  }

  return (
    <Popover
      id={open ? "house-details-popover" : undefined}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        style: {
          backgroundColor: "rgba(50, 50, 50, 0.9)", // Consistent styling
          borderRadius: "8px",
          backdropFilter: "blur(5px)",
          padding: "2px", // Adjusted padding slightly
        },
      }}
    >
      {/* Match styling from original HouseNode popover content */}
      <Typography sx={{ p: 1, fontSize: '0.7rem', color: "#fff" }}> {/* Added color */}
        🏡 {nodeData.homeTown}
      </Typography>
    </Popover>
  );
};
