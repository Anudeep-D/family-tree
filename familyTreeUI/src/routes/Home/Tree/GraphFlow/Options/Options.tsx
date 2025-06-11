import * as React from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import { ListTwoTone } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import "./Options.scss";

const actions = [
  { icon: <FileCopyIcon />, name: "Copy" },
  { icon: <SaveIcon />, name: "Save" },
  { icon: <PrintIcon />, name: "Print" },
  { icon: <ShareIcon />, name: "Share" },
];

export const Options = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <SpeedDial
      className="flow-options-dial"
      ariaLabel="Options"
      icon={<SpeedDialIcon icon={<ListTwoTone fontSize="small" />} />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="left"
      FabProps={{
        size: "small",
        sx: {
          alignItems: "flex-end",
          backgroundColor: "transparent",
          boxShadow: "none",
          minHeight: "30px",
          width: "30px",
          height: "30px",
          color: "primary.main",
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
      }}
      sx={{
        "& .MuiFab-root": {
          minHeight: "30px",
          width: "30px",
          height: "30px",
        },
        "& .MuiSvgIcon-root": {
          fontSize: "1.2rem",
        },
      }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          onClick={handleClose}
          slotProps={{
            tooltip: { placement: "bottom", title: action.name },
            fab: {
              size: "small",
              sx: {
                backgroundColor: "transparent",
                color: "text.primary",
                boxShadow: "none",
                minHeight: "30px",
                width: "30px",
                height: "30px",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};
