import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";

interface SavedFilter {
  id: string;
  label: string;
}

interface DeleteFilterDialogProps {
  open: boolean;
  onClose: () => void;
  savedFilters: SavedFilter[];
  filtersToDelete: string[];
  onToggleFilter: (id: string) => void;
  onDeleteFilters: () => void;
}

const DeleteFilterDialog = ({
  open,
  onClose,
  savedFilters,
  filtersToDelete,
  onToggleFilter,
  onDeleteFilters,
}: DeleteFilterDialogProps) => {
  return (
    <Dialog disablePortal open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Filters</DialogTitle>
      <DialogContent dividers>
        {savedFilters.map((filter) => (
          <FormControlLabel
            key={filter.id}
            control={
              <Checkbox
                checked={filtersToDelete.includes(filter.id)}
                onChange={() => onToggleFilter(filter.id)}
              />
            }
            label={filter.label}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="info" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onDeleteFilters}
          color="error"
          disabled={filtersToDelete.length === 0}
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFilterDialog;
