// NodeDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { NodeDataMap, nodeFieldTemplates, Nodes } from "@/types/nodeTypes";

type NodeDialogProps = {
  mode: "new" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (type: Nodes, data: Record<string, string>) => void;
  type?: Nodes;
  initialData?: Record<string, string>;
};

// Field configuration for each node type
const nodeFields = Object.fromEntries(
  Object.entries(nodeFieldTemplates).map(([key, value]) => [
    key,
    Object.keys(value),
  ])
) as Record<Nodes, string[]>;

export const NodeDialog: React.FC<NodeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type = Nodes.Person,
  initialData,
}) => {
  const fields = nodeFields[type];
  const [formState, setFormState] = useState<
    Record<string, string> | undefined
  >(initialData);
  const handleChange = (key: string, value: string) => {
    setFormState((prev) =>
      prev ? { ...prev, [key]: value } : { [key]: value }
    );
  };

  const handleSubmit = () => {
    onSubmit(type, formState ?? {});
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? `Edit ${type}` : `Add New ${type}`}
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          columns={12}
          columnSpacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 2,
          }}
        >
          {fields?.map((key) => (
            <Grid sx={{ gridColumn: "span 6" }} key={key}>
              <TextField
                label={key}
                value={formState ? formState[key] : ""}
                onChange={(e) => handleChange(key, e.target.value)}
                fullWidth
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
