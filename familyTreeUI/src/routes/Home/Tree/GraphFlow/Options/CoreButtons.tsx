import ConfirmDialog, { ConfirmProps } from "@/routes/common/ConfirmDialog";
import { Project } from "@/types/entityTypes";
import { DeleteTwoTone, Restore, SaveTwoTone } from "@mui/icons-material";
import { Box, Tooltip, IconButton } from "@mui/material";
import { Options } from "./Options";
import "./CoreButtons.scss";
import { useState } from "react";

type CoreButtonsProps = {
  project: Project;
  handleReset: () => void;
  handleSave: () => void;
  handleDelete: () => void;
};
export const CoreButtons: React.FC<CoreButtonsProps> = ({
  project,
  handleReset,
  handleSave,
  handleDelete,
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
      <Options />
      <Tooltip title="Delete">
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() =>
            setDialogOpen({
              open: true,
              type: "error",
              action: "Delete",
              title: `Delete project ${project.elementId}`,
              message:
                "Are you sure you want to delete this project? This action cannot be undone.",
            })
          }
        >
          <DeleteTwoTone fontSize="small" color="error" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset">
        <IconButton
          size="small"
          aria-label="reset"
          onClick={() =>
            setDialogOpen({
              open: true,
              type: "warning",
              action: "Reset",
              title: `Reset project ${project.name}`,
              message:
                "Are you sure you want to reset this project to original? This action cannot be undone.",
            })
          }
        >
          <Restore fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save">
        <IconButton
          size="small"
          aria-label="save"
          onClick={() =>
            setDialogOpen({
              open: true,
              type: "primary",
              action: "Save",
              title: `Save project ${project.elementId}`,
              message: "Are you sure you want to save this project?",
            })
          }
        >
          <SaveTwoTone fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>
      <ConfirmDialog
        onClose={() => setDialogOpen({ open: false })}
        onConfirm={handleConfirmation}
        {...dialogOpen}
      />
    </Box>
  );
};
