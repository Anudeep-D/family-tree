import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  action?: string;
  title?: string;
  message?: string;
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  type,
  action,
  title = "Confirmation dialog title",
  message = "Confirmation dialog message",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color={type ?? "primary"}
          variant="contained"
          autoFocus
        >
          {action ?? "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
