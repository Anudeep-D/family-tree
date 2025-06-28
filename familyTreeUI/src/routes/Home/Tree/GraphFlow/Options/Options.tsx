import React, { ReactElement } from "react";
import { Stack, IconButton, Tooltip, ClickAwayListener } from "@mui/material";
import {
  ManageAccountsTwoTone,
  SearchTwoTone,
  SmartToyTwoTone,
  SortTwoTone,
  TuneTwoTone,
} from "@mui/icons-material";
import "./Options.scss";
import AccessDialog from "./Option/AccessDialog/AccessDialog";
import { Tree } from "@/types/entityTypes";
import { PopperWrapper } from "./Popper/PopperWrapper";
import { FindPopper } from "./Option/Find/FindPopper";
import FiltersPopper from "./Option/Filter/FiltersPopper";

interface OptionsProps {
  tree: Tree;
  sortTree: () => void;
}

const actions = [
  {
    icon: <ManageAccountsTwoTone fontSize="small" sx={{ color: "#82b1ff" }} />,
    name: "Access",
    actionKey: "access",
  },
  {
    icon: <SortTwoTone fontSize="small" sx={{ color: "#e040fb" }} />,
    name: "Sort",
    actionKey: "sort",
  },
  {
    icon: <TuneTwoTone fontSize="small" sx={{ color: "#64ffda" }} />,
    name: "Filter",
    actionKey: "filter",
    airaDescribedby: "transition-popper",
  },
  {
    icon: <SearchTwoTone fontSize="small" sx={{ color: "#ffd54f" }} />,
    name: "Find",
    actionKey: "find",
    airaDescribedby: "transition-popper",
  },
  {
    icon: <SmartToyTwoTone fontSize="small" sx={{ color: "#82b1ff" }} />,
    name: "Chat",
    actionKey: "chat",
    airaDescribedby: "transition-popper",
  },
];

export const Options: React.FC<OptionsProps> = ({ tree, sortTree }) => {
  const [isAccessDialogOpen, setAccessDialogOpen] = React.useState(false);
  const [openPopper, setOpenPopper] = React.useState(false);
  const [popperAnchorEl, setPopperAnchorEl] = React.useState<
    undefined | HTMLElement
  >(undefined);
  const [popperChild, setPopperChild] = React.useState<ReactElement | null>(
    null
  );

  const handleClickAway = () => {
    setOpenPopper(false);
  };

  const handleActionClick = (
    actionKey: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    switch (actionKey) {
      case "access":
        setAccessDialogOpen(true);
        break;
      case "sort":
        sortTree();
        break;
      case "find":
        if (openPopper) {
          setOpenPopper(false);
          break;
        }
        setPopperAnchorEl(event.currentTarget);
        setPopperChild(<FindPopper />);
        setOpenPopper((prev) => !prev);
        break;
      case "filter":
        if (openPopper) {
          setOpenPopper(false);
          break;
        }
        setPopperAnchorEl(event.currentTarget);
        setPopperChild(<FiltersPopper onClose={()=>setOpenPopper(false)} />);
        setOpenPopper((prev) => !prev);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} className="flow-options-stack">
        {actions.map((action) => (
          <Tooltip key={action.name} title={action.name} placement="top">
            <IconButton
              aria-label={action.name}
              aria-describedby={action.airaDescribedby}
              size="small"
              onClick={(event) => handleActionClick(action.actionKey, event)}
              // sx={{
              //   backgroundColor: "transparent",
              //   color: "text.primary",
              //   boxShadow: "none",
              //   width: 30,
              //   height: 30,
              //   p: 0.5,
              //   "&:hover": {
              //     backgroundColor: "action.hover",
              //   },
              // }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      <AccessDialog
        open={isAccessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        tree={tree}
      />

      <PopperWrapper open={openPopper} anchorEl={popperAnchorEl}>
        <ClickAwayListener onClickAway={handleClickAway}>
          {popperChild ?? <div />}
        </ClickAwayListener>
      </PopperWrapper>
    </>
  );
};
