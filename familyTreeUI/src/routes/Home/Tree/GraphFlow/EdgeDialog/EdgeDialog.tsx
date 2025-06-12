// EdgeDialog.tsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { edgeFieldTemplates, Edges } from "@/types/edgeTypes";

type EdgeDialogProps = {
  mode: "new" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (type: Edges, data: Record<string, string>) => void;
  type?: Edges;
  initialData?: Record<string, string>;
};

// Field configuration for each edge type
const egdeFields = Object.fromEntries(
  Object.entries(edgeFieldTemplates).map(([key, value]) => [
    key,
    Object.keys(value),
  ])
) as Record<Edges, string[]>;

export const EdgeDialog: React.FC<EdgeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  initialData,
}) => {
  const [edgeType, setEdgeType] = useState(type);
  const fields = useMemo(() => {
    if (edgeType) return egdeFields[edgeType];
    return [];
  }, [edgeType]);

  const [formState, setFormState] = useState<
    Record<string, string> | undefined
  >(initialData);
  const handleChange = (key: string, value: string) => {
    setFormState((prev) =>
      prev ? { ...prev, [key]: value } : { [key]: value }
    );
  };

  const handleSubmit = () => {
    onSubmit(edgeType!, formState ?? {});
  };

  const handleSelect = (event: SelectChangeEvent) => {
    setEdgeType(event.target.value as Edges | undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box component="span" sx={{ whiteSpace: "nowrap" }}>
            {initialData ? "Edit Edge" : "Add New Edge"}
          </Box>
          <FormControl
            required
            size="small"
            sx={{ minWidth: 160, width: "auto", flexShrink: 0 }}
          >
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={edgeType ?? ""}
              label="Type"
              onChange={handleSelect}
            >
              <MenuItem value={undefined}>None</MenuItem>
              <MenuItem value={Edges.BELONGS_TO}>{Edges.BELONGS_TO}</MenuItem>
              <MenuItem value={Edges.PARENT_OF}>{Edges.PARENT_OF}</MenuItem>
              <MenuItem value={Edges.MARRIED_TO}>{Edges.MARRIED_TO}</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!Boolean(edgeType)}
          variant="contained"
          onClick={handleSubmit}
        >
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
