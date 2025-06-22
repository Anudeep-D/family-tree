import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
  SelectChangeEvent,
  Autocomplete,
  IconButton,
} from "@mui/material";

import { DeleteTwoTone } from "@mui/icons-material";
import { useGetUsersAccessWithTreeQuery } from "@/redux/queries/user-endpoints";
import { Role } from "@/types/common";
import { Tree, User } from "@/types/entityTypes";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/common";
import { useUpdateUsersToTreeMutation } from "@/redux/queries/tree-endpoints";
import ConfirmDialog, { ConfirmProps } from "@/routes/common/ConfirmDialog";

interface AccessDialogProps {
  open: boolean;
  onClose: () => void;
  tree: Tree;
}

const AccessDialog: React.FC<AccessDialogProps> = ({ open, onClose, tree }) => {
  const treeId = tree.elementId!;
  const { user } = useAuth();
  const currentUser: User = useMemo(
    () => ({ ...user, access: tree.access }),
    [user]
  );
  const {
    data: allUsers,
    error: usersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
  } = useGetUsersAccessWithTreeQuery({ treeId: treeId });

  const [
    updateUsersToTree, // Changed
    {
      data: counts,
      isError: isErrorOnUpdateUsers,
      error: errorOnUpdateUsers,
      isLoading: isUpdatingUsers,
    },
  ] = useUpdateUsersToTreeMutation();

  const isLoadingTreeUsers = useMemo(
    () => isUsersLoading && isUsersFetching,
    [isUsersLoading, isUsersFetching]
  );
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmProps>({
    open: false,
  });
  const [treeUsers, setTreeUsers] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  useEffect(() => {
    if (allUsers) {
      setTreeUsers(
        allUsers.filter(
          (user) =>
            user.elementId !== currentUser.elementId && Boolean(user.access)
        )
      );
      setOtherUsers(allUsers.filter((user) => !Boolean(user.access)));
    }
    if (usersError) setError(usersError);
    if (isErrorOnUpdateUsers) setError(errorOnUpdateUsers);
  }, [allUsers, usersError, isErrorOnUpdateUsers, errorOnUpdateUsers]);

  const [error, setError] = useState<any>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Viewer);

  const handleUserUpdate = (user: User, newRole: Role) => {
    setTreeUsers((prev) =>
      prev.map((u) =>
        u.elementId === user.elementId ? { ...u, access: newRole } : u
      )
    );
    setShouldUpdate(true);
  };

  const handleDelete = (user: User) => {
    setTreeUsers((prev) => prev.filter((u) => u.elementId === user.elementId));
    setOtherUsers((prev) => [
      ...prev,
      {
        ...user,
        access: undefined,
      },
    ]);
    setShouldUpdate(true);
    setConfirmDialog({ open: false });
  };

  const handleAddUser = () => {
    if (
      selectedUser &&
      !treeUsers.find((u) => u.elementId === selectedUser.elementId)
    ) {
      setTreeUsers((prev) => [
        ...prev,
        {
          ...selectedUser,
          access: selectedRole,
        },
      ]);
      setOtherUsers((prev) =>
        prev.filter((u) => u.elementId !== selectedUser.elementId)
      );
    }
    setShouldUpdate(true);
    setSelectedUser(null);
    setSelectedRole(Role.Viewer);
    setOpenDialog(false);
  };

  const handleConfirm = () => {
    const userIds =
      allUsers
        ?.filter((eachUser) => {
          if (eachUser.elementId === currentUser.elementId) return false;
          if (eachUser.access) {
            if (
              !treeUsers.find(
                (treeUser) =>
                  eachUser.elementId === treeUser.elementId &&
                  eachUser.access === treeUser.access
              )
            )
              return true; // deleted/updated access
          }
          if (
            !eachUser.access &&
            treeUsers.find(
              (treeUser) => eachUser.elementId === treeUser.elementId
            )
          )
            return true; //new access
        })
        .map((modifiedUser) => modifiedUser.elementId!) ?? [];
    const assignedUsers = userIds.map((id) => {
      const tempUser = treeUsers.find((treeUser) => treeUser.elementId === id);
      if (tempUser) return { elementId: id, role: tempUser.access ?? null };
      return { elementId: id, role: null };
    });
    setConfirmDialog({ open: false });
    setShouldUpdate(false);
    updateUsersToTree({
      treeId: tree.elementId!,
      users: assignedUsers,
    });
  };

  const isAdmin = currentUser?.access === Role.Admin;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Access details for Tree:{" "}
        <Typography component="span" variant="h6" fontWeight="bold">
          {tree.name}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        )}
        {counts && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {`Access changes — Updated: ${counts["updated"]}, Removed: ${counts["removed"]}, Created: ${counts["created"]}`}
          </Alert>
        )}

        {currentUser ? (
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Your Access:{" "}
            <Typography variant="h6" color="#bcfffd" component="span" fontWeight="bold">
              {currentUser.access}
            </Typography>
          </Typography>
        ) : null}
        {isUpdatingUsers && <CircularProgress />}
        {!isUpdatingUsers && (
          <Box>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={() => setOpenDialog(true)}
              >
                Add User
              </Button>
            )}
            <Typography variant="h6" gutterBottom>
              Users with Access
            </Typography>
            {isLoadingTreeUsers ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress />
              </Box>
            ) : treeUsers.length === 0 && !isLoadingTreeUsers ? (
              <Typography sx={{ my: 2 }}>
                No users have access to this tree yet.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Access</TableCell>
                      {isAdmin && <TableCell>Delete</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treeUsers.map((user) => (
                      <TableRow key={user.elementId}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Select
                              value={user.access}
                              onChange={(e: SelectChangeEvent<Role>) =>
                                handleUserUpdate(user, e.target.value as Role)
                              }
                              fullWidth
                              size="small"
                            >
                              {Object.values(Role).map((roleValue) => (
                                <MenuItem key={roleValue} value={roleValue}>
                                  {roleValue}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            user.access
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  type: "error",
                                  action: "Delete",
                                  title: `Delete access for ${user.name}`,
                                  message:
                                    "Are you sure you want to delete access for this user?",
                                  onConfirm: () => handleDelete(user),
                                });
                              }}
                              size="small"
                            >
                              <DeleteTwoTone />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        {isAdmin && (
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add User</DialogTitle>
            <DialogContent>
              <Autocomplete
                options={otherUsers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={selectedUser}
                onChange={(_event, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label="Select User"
                    fullWidth
                  />
                )}
                fullWidth
              />
              <Select
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                fullWidth
                size="small"
                sx={{ mt: 2 }}
              >
                {Object.values(Role).map((roleValue) => (
                  <MenuItem key={roleValue} value={roleValue}>
                    {roleValue}
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                onClick={handleAddUser}
                variant="contained"
                disabled={!selectedUser}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <ConfirmDialog {...confirmDialog} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {isAdmin && (
          <Button
            disabled={!shouldUpdate}
            onClick={() => {
              setConfirmDialog({
                open: true,
                type: "info",
                action: "Update",
                title: `Update the access for users`,
                message:
                  "Are you sure you want to update access details for users?",
                onConfirm: () => handleConfirm(),
              });
            }}
            variant="contained"
          >
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AccessDialog;
