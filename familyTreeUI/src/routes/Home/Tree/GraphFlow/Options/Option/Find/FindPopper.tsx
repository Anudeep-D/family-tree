import { selectNodes } from "@/redux/treeConfigSlice";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useReactFlow } from "@xyflow/react";
import { useMemo, forwardRef } from "react";
import { useSelector } from "react-redux";

export type FindPopperProps = {};
export const FindPopper = forwardRef<HTMLDivElement, FindPopperProps>(
  ({}, ref) => {
    const currentNodes = useSelector(selectNodes);
    const options = useMemo(
      () =>
        currentNodes?.map((curNode) => ({
          id: curNode.id,
          label: `${curNode.data?.["name"]} (${curNode.type})`,
        })),
      [currentNodes]
    );
    const { setCenter } = useReactFlow();
    const handleFind = (searchId: string) => {
      const node = currentNodes.find((n) => n.id === searchId);
      if (node) {
        setCenter(node.position.x, node.position.y, {
          zoom: 1.3,
          duration: 800,
        });
      } else {
        console.warn("Node not found");
      }
    };

    return (
      <Box ref={ref}>
        <Autocomplete
          autoComplete
          autoHighlight
          fullWidth
          size="small"
          disablePortal
          options={options}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Select node to focus" />
          )}
          onChange={(
            _event: any,
            newValue: { id: string; label: string } | null
          ) => {
            newValue && handleFind(newValue.id);
          }}
        />
      </Box>
    );
  }
);
