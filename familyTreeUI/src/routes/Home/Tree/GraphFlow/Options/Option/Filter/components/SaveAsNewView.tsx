import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { RefObject } from "react";

interface SaveAsNewViewProps {
  filterName: string;
  onFilterNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  saving: boolean;
  nameExists: boolean | null;
  checking: boolean;
  inputRef: RefObject<HTMLInputElement>;
}

const SaveAsNewView = ({
  filterName,
  onFilterNameChange,
  onSave,
  saving,
  nameExists,
  checking,
  inputRef,
}: SaveAsNewViewProps) => {
  return (
    <Box>
      <Divider sx={{ my: 2 }} />
      <Stack>
        <TextField
          label="Filter name"
          focused
          placeholder="Filter name"
          value={filterName}
          inputRef={inputRef}
          onChange={onFilterNameChange}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          disabled={
            saving || filterName.trim().length === 0 || nameExists === true
          }
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
      </Stack>
      {checking && <CircularProgress size={20} sx={{ mt: 1 }} />}
      {nameExists === true && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Name already exists
        </Alert>
      )}
    </Box>
  );
};

export default SaveAsNewView;
