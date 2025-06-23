import React, { ReactNode } from "react";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
export type PopperWrapperProps = {
  open: boolean;
  anchorEl?: HTMLElement;
  children?: ReactNode;
};
export const PopperWrapper: React.FC<PopperWrapperProps> = ({
  open,
  children,
  anchorEl,
}) => {
  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;
  return (
    <Popper id={id} open={open} anchorEl={anchorEl} transition>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Box sx={{ border: 1, p: 1 }}>
            {children}
          </Box>
        </Fade>
      )}
    </Popper>
  );
};
