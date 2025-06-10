import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import "./CreateProject.scss";
import { useGetUsersQuery } from "@/redux/queries/user-endpoints";
import {
  useCreateProjectMutation,
  useAddUsersToProjectMutation,
} from "@/redux/queries/project-endpoints";
import { Role } from "@/types/common";

type AssignedUser = {
  elementId: string;
  role: Role;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const CreateProject = ({ open, onClose }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [callAddUsers, setCallAddUsers] = useState(false);

  const [
    createProjectMutation,
    {
      data: newProject,
      isError: isErrorOnCreate,
      error: errorOnCreate,
      isLoading: isCreating,
    },
  ] = useCreateProjectMutation();

  const [
    addUsersToProjectMutation,
    {
      isError: isErrorOnAddUsers,
      error: errorOnAddUsers,
      isLoading: isAddingUsers,
    },
  ] = useAddUsersToProjectMutation();
  const {
    data: allUsers,
    error: usersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
  } = useGetUsersQuery();

  const handleChangeUser = (
    index: number,
    field: "elementId" | "role",
    value: string
  ) => {
    const updated = [...users];
    updated[index][field] = value as any;
    setUsers(updated);
  };

  const onSubmit = (_data: { name: string; description: string }) => {
    createProjectMutation({
      name: name,
      desc: description,
      createdAt: (new Date()).toISOString(),
    });
  };
  const handleAddUser = () => {
    setUsers([...users, { elementId: "", role: Role.Viewer }]);
  };

  const handleRemoveUser = (index: number) => {
    const updated = users.filter((_, i) => i !== index);
    setUsers(updated);
  };

  const handleSubmit = () => {
    onSubmit({ name, description });
    setName("");
    setDescription("");
    if (users.length === 0) onClose();
    else setCallAddUsers(true);
  };

  useEffect(() => {
    if (callAddUsers && newProject) {
      addUsersToProjectMutation({
        projectId: newProject.elementId!,
        users: users,
      });
      setUsers([]);
      setCallAddUsers(false);
      onClose();
    }
  }, [callAddUsers, newProject]);

  const errorMsg = useMemo(() => {
    if (isErrorOnCreate && errorOnCreate) {
      return "Failed to create project";
    }
    if (isErrorOnAddUsers && errorOnAddUsers) {
      return "Project created but failed to add users to project";
    }
    return null;
  }, [isErrorOnAddUsers, isErrorOnCreate, errorOnCreate, errorOnAddUsers]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="modalHeader">
        Create New Project
        <IconButton onClick={onClose} className="closeIcon">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="modalBody">
        <Typography variant="body2" mb={2}>
          Fill in the details below to create a new project and assign user
          roles.
        </Typography>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <TextField
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isCreating && isAddingUsers}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          disabled={isCreating && isAddingUsers}
        />

        <Box mt={3}>
          <Typography fontWeight="bold" mb={1}>
            Assign Users
          </Typography>
          {isUsersLoading || isUsersFetching ? (
            <CircularProgress />
          ) : usersError ? (
            <Alert severity="error">Failed to get users</Alert>
          ) : (
            (!allUsers || allUsers.length === 0) && (
              <Alert severity="info">No users to assign</Alert>
            )
          )}
          {allUsers &&
            allUsers.length > 0 &&
            users.map((user, index) => (
              <Box key={index} className="userRow">
                <Autocomplete
                  disabled={isCreating && isAddingUsers}
                  options={allUsers}
                  getOptionLabel={(option) => option.email ?? "-"}
                  value={
                    allUsers.find((u) => u.elementId === user.elementId) || null
                  }
                  onChange={(_, newValue) => {
                    handleChangeUser(
                      index,
                      "elementId",
                      newValue?.elementId || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="User Email" fullWidth />
                  )}
                  fullWidth
                />
                <FormControl className="roleSelect">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={user.role}
                    label="Role"
                    onChange={(e) =>
                      handleChangeUser(index, "role", e.target.value)
                    }
                    disabled={isCreating && isAddingUsers}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Editor">Editor</MenuItem>
                    <MenuItem value="Viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  disabled={isCreating && isAddingUsers}
                  onClick={() => handleRemoveUser(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
          {allUsers && allUsers.length > 0 && (
            <Button
              onClick={handleAddUser}
              variant="outlined"
              className="addUserBtn"
              disabled={isCreating && isAddingUsers}
            >
              + Add another user
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions className="modalActions">
        <Button disabled={isCreating && isAddingUsers} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          loading={isCreating && isAddingUsers}
          loadingPosition="start"
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProject;
