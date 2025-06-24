import { Box } from "@mui/material";
import { forwardRef } from "react";

export type FiltersPopperProps = {};
export const FiltersPopper = forwardRef<HTMLDivElement, FiltersPopperProps>(
  ({}, ref) => {

    return (
      <Box ref={ref}>
        {"// filter options comes here"}
      </Box>
    );
  }
);
