import * as React from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { FilterAltTwoTone, ListTwoTone, SearchTwoTone, SmartToyTwoTone, SortTwoTone } from "@mui/icons-material";
import "./Options.scss";

const actions = [
  { icon: <SortTwoTone sx={{ color: "#e040fb" }} />, name: "Sort" },
  { icon: <FilterAltTwoTone sx={{ color: "#64ffda" }} />, name: "Filter" },
  { icon: <SearchTwoTone sx={{ color: "#ffd54f" }} />, name: "Search" },
  { icon: <SmartToyTwoTone sx={{ color: "#82b1ff" }} />, name: "Chat" },
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
