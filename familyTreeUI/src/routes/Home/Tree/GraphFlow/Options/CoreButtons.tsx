import ConfirmDialog, { ConfirmProps } from "@/routes/common/ConfirmDialog";
import { Tree } from "@/types/entityTypes";
import { DeleteTwoTone, Restore, SaveTwoTone } from "@mui/icons-material";
import { Box, Tooltip, IconButton } from "@mui/material";
import { Options } from "./Options";
import "./CoreButtons.scss";
import { useState } from "react";
import { Role } from "@/types/common";
// const VIEWER_ACCESS = "Viewer"; // Not explicitly used in this component's logic for button rendering but good for consistency

type CoreButtonsProps = {
  tree: Tree;
  handleReset: () => void;
  handleSave: () => void;
  handleDelete: () => void;
  disabled?: boolean;
  sortTree:() => void;
};
export const CoreButtons: React.FC<CoreButtonsProps> = ({
  tree,
  handleReset,
  handleSave,
  handleDelete,
  disabled,
  sortTree,
}) => {
  //ConfirmDialog related
  const [dialogOpen, setDialogOpen] = useState<ConfirmProps>({ open: false });
  const handleConfirmation = () => {
    if (dialogOpen.action === "Reset") {
      handleReset();
    }
    if (dialogOpen.action === "Save") {
      handleSave();
    }
    if (dialogOpen.action === "Delete") {
      handleDelete();
    }
    setDialogOpen({ open: false });
  };
  return (
    <Box className="flow-save-buttons">
      <Options tree={tree} sortTree={sortTree}/> {/* Pass tree.id as treeId */}
      {tree.access === Role.Admin && (
        <Tooltip title="Delete">
          <IconButton
            disabled={disabled}
            aria-label="delete"
            size="small"
            onClick={() =>
              setDialogOpen({
                open: true,
                type: "error",
                action: "Delete",
                title: `Delete tree ${tree.name}`,
                message:
                  "Are you sure you want to delete this tree? This action cannot be undone.",
              })
            }
          >
            <DeleteTwoTone
              fontSize="small"
              color={disabled ? "disabled" : "error"}
            />
          </IconButton>
        </Tooltip>
      )}
      {tree.access === Role.Admin && (
        <Tooltip title="Reset">
          <IconButton
            disabled={disabled}
            size="small"
            aria-label="reset"
            onClick={() =>
              setDialogOpen({
                open: true,
                type: "warning",
                action: "Reset",
                title: `Reset tree ${tree.name}`,
                message:
                  "Are you sure you want to reset this tree to original? This action cannot be undone.",
              })
            }
          >
            <Restore
              fontSize="small"
              color={disabled ? "disabled" : "action"}
            />
          </IconButton>
        </Tooltip>
      )}
      {(tree.access === Role.Admin || tree.access === Role.Editor) && (
        <Tooltip title="Save">
          <IconButton
            disabled={disabled}
            size="small"
            aria-label="save"
            onClick={() =>
              setDialogOpen({
                open: true,
                type: "primary",
                action: "Save",
                title: `Save tree ${tree.name}`,
                message: "Are you sure you want to save this tree?",
              })
            }
          >
            <SaveTwoTone
              fontSize="small"
              color={disabled ? "disabled" : "primary"}
            />
          </IconButton>
        </Tooltip>
      )}
      <ConfirmDialog
        onClose={() => setDialogOpen({ open: false })}
        onConfirm={handleConfirmation}
        {...dialogOpen}
      />
    </Box>
  );
};
