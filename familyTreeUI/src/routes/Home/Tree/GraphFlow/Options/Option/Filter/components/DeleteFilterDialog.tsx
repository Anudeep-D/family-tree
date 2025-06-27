import { useDeleteMultipleFiltersMutation } from "@/redux/queries/filter-endpoints";
import { selectSavedFilters } from "@/redux/treeConfigSlice";
import { getErrorMessage } from "@/utils/common";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

interface DeleteFilterDialogProps {
  open: boolean;
  onClose: () => void;
}

const DeleteFilterDialog = ({
  open,
  onClose,
}: DeleteFilterDialogProps) => {
  const [filtersToDelete, setFiltersToDelete] = useState<string[]>([]);
  const [
    deleteMultipleFilters, // Changed
    { isError: isErrorOnDelete, error: errorOnDelete, isLoading: isDeleting },
  ] = useDeleteMultipleFiltersMutation();

  const handleToggleFilter = (id: string) => {
    setFiltersToDelete((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleDeleteFilters = () => {
    // handle delete logic here using filtersToDelete
    deleteMultipleFilters({ ids: filtersToDelete });
    setFiltersToDelete([]);
  };

  const savedFilters = useSelector(selectSavedFilters);
  return (
    <Dialog disablePortal open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Filters</DialogTitle>
      <DialogContent dividers>
        {isErrorOnDelete && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(errorOnDelete)}
          </Alert>
        )}
        {savedFilters.map((filter) => (
          <FormControlLabel
            key={filter.elementId}
            control={
              <Checkbox
                checked={filtersToDelete.includes(filter.elementId)}
                onChange={() => handleToggleFilter(filter.elementId)}
              />
            }
            label={filter.filterName}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="info"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteFilters}
          color="error"
          disabled={filtersToDelete.length === 0}
          variant="contained"
          loading={isDeleting}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFilterDialog;
