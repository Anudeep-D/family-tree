import { ConfirmProps } from "@/routes/common/ConfirmDialog";
import { Project } from "@/types/entityTypes";
import { DeleteTwoTone, Restore, SaveTwoTone } from "@mui/icons-material";
import { Box, Tooltip, IconButton } from "@mui/material";
import "./CoreButtons.scss"

type CoreButtonsProps = {
  setDialogOpen: (confirm: ConfirmProps) => void;
  project: Project;
};
export const CoreButtons: React.FC<CoreButtonsProps> = ({ setDialogOpen, project }) => {
  return (
    <Box className="flow-save-buttons">
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
    </Box>
  );
};
