import React, { useMemo, ReactElement } from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import {
  ListTwoTone,
  ManageAccountsTwoTone,
  SearchTwoTone,
  SmartToyTwoTone,
  SortTwoTone,
  TuneTwoTone,
  PersonPinCircleTwoTone,
} from "@mui/icons-material";
import "./Options.scss";
import AccessDialog from "./Option/AccessDialog/AccessDialog";
import { Tree } from "@/types/entityTypes";
import { PopperWrapper } from "./Popper/PopperWrapper";
import { Autocomplete, ClickAwayListener, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { selectNodes } from "@/redux/treeConfigSlice";
import { FindPopper } from "./Option/Find/FindPopper";

interface OptionsProps {
  tree: Tree;
  sortTree: () => void;
}

const actions = [
  {
    icon: <ManageAccountsTwoTone sx={{ color: "#82b1ff" }} />,
    name: "Access",
    actionKey: "access",
  },
  {
    icon: <SortTwoTone sx={{ color: "#e040fb" }} />,
    name: "Sort",
    actionKey: "sort",
  },
  {
    icon: <TuneTwoTone sx={{ color: "#64ffda" }} />,
    name: "Filter",
    actionKey: "filter",
    airaDescribedby: "transition-popper",
  },
  {
    icon: <SearchTwoTone sx={{ color: "#ffd54f" }} />,
    name: "Find",
    actionKey: "find",
    airaDescribedby: "transition-popper",
  },
  {
    icon: <PersonPinCircleTwoTone sx={{ color: "#ff9d9d" }} />,
    name: "Root",
    actionKey: "root",
    airaDescribedby: "transition-popper",
  },
  {
    icon: <SmartToyTwoTone sx={{ color: "#82b1ff" }} />,
    name: "Chat",
    actionKey: "chat",
    airaDescribedby: "transition-popper",
  },
];

export const Options: React.FC<OptionsProps> = ({ tree, sortTree }) => {
  const [open, setOpen] = React.useState(false);
  const [isAccessDialogOpen, setAccessDialogOpen] = React.useState(false);
  const [openPopper, setOpenPopper] = React.useState(false);
  const [popperAnchorEl, setPopperAnchorEl] = React.useState<
    undefined | HTMLElement
  >(undefined);
  const [popperChild, setPopperChild] = React.useState<ReactElement | null>(
    null
  );
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClickAway = () => {
    setOpenPopper(false);
    handleClose();
  };
  const handleActionClick = (
    actionKey: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (actionKey === "access") {
      setAccessDialogOpen(true);
      handleClose();
    }
    if (actionKey === "sort") {
      sortTree();
      handleClose();
    }
    if (actionKey === "find") {
      setPopperAnchorEl(event.currentTarget);
      setPopperChild(<FindPopper />);
      setOpenPopper(true);
    }
    // Add other action handlers here if needed
  };

  return (
    <>
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
            aria-describedby={action.airaDescribedby}
            key={action.name}
            icon={action.icon}
            onClick={(event) => handleActionClick(action.actionKey, event)}
            slotProps={{
              tooltip: {
                placement: "top",
                title: action.name,
                sx: {
                  gap:0,
                },
              },
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
      <AccessDialog
        open={isAccessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        tree={tree}
      />
      <PopperWrapper open={openPopper} anchorEl={popperAnchorEl}>
        <ClickAwayListener onClickAway={handleClickAway}>
          {popperChild ? popperChild : <div />}
        </ClickAwayListener>
      </PopperWrapper>
    </>
  );
};
