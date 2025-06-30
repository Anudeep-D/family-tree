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
  FormHelperText, // Added
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import { useGetUsersQuery } from "@/redux/queries/user-endpoints";
import { Role } from "@/types/common";
import { useNavigate } from "react-router-dom";
import "./CreateTree.scss"; // Changed
import {
  useCreateTreeMutation,
  useAddUsersToTreeMutation,
} from "@/redux/queries/tree-endpoints";
import { useAuth } from "@/hooks/useAuth";

type AssignedUser = {
  elementId: string;
  role: Role;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const CreateTree = ({ open, onClose }: Props) => {
  // Changed
  const { user: curUser } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [errors, setErrors] = useState<Record<string, string | string[]>>({}); // Added errors state
  const [callAddUsers, setCallAddUsers] = useState(false);
  const navigate = useNavigate();
  const handleTreeSelection = (treeId: string) => {
    // Changed
    navigate(`/trees/${encodeURIComponent(treeId)}`); // Changed
  };
  const [
    createTreeMutation, // Changed
    {
      data: newTree, // Changed
      isError: isErrorOnCreate,
      error: errorOnCreate,
      isLoading: isCreating,
    },
  ] = useCreateTreeMutation(); // Changed

  const [
    addUsersToTreeMutation, // Changed
    {
      isError: isErrorOnAddUsers,
      error: errorOnAddUsers,
      isLoading: isAddingUsers,
    },
  ] = useAddUsersToTreeMutation(); // Changed
  const {
    data: allUsersIncCurrent,
    error: usersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
  } = useGetUsersQuery();

  const allUsers = useMemo(
    () =>{
      const curUserIds:string[] = []; //users.map(usr=>usr.elementId);
      curUser?.elementId && curUserIds.push(curUser.elementId);
      return allUsersIncCurrent
        ? allUsersIncCurrent.filter(
            (user) => !curUserIds.includes(user!.elementId!)
          )
        : undefined;
    },
    [allUsersIncCurrent, users]
  );

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
    createTreeMutation({
      // Changed
      name: name,
      desc: description,
      createdAt: new Date().toISOString(),
    });
  };
  const handleAddUser = () => {
    setUsers([...users, { elementId: "", role: Role.Viewer }]);
  };

  const handleRemoveUser = (index: number) => {
    const updated = users.filter((_, i) => i !== index);
    setUsers(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Tree Name is required.";
      isValid = false;
    }

    const userErrors: string[] = Array(users.length).fill("");
    users.forEach((user, index) => {
      if (!user.elementId) {
        userErrors[index] =
          "User Email is required. " + (userErrors[index] || "");
        isValid = false;
      }
      if (!user.role) {
        userErrors[index] =
          (userErrors[index] || "") + "User Role is required.";
        isValid = false;
      }
    });

    if (userErrors.some((e) => e !== "")) {
      newErrors.users = userErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit({ name, description });
    // Keep name and description, don't clear them here,
    // allow parent or success effect to handle clearing or closing.
    // setName("");
    // setDescription("");
    if (users.length === 0) {
      onClose();
    } else setCallAddUsers(true);
  };

  useEffect(() => {
    if (newTree) {
      // Changed
      if (callAddUsers) {
        addUsersToTreeMutation({
          // Changed
          treeId: newTree.elementId!, // Changed
          users: users,
        });
        setUsers([]);
        setCallAddUsers(false);
        onClose();
      }
      handleTreeSelection(newTree.elementId!); // Changed
    }
  }, [callAddUsers, newTree]); // Changed

  const errorMsg = useMemo(() => {
    if (isErrorOnCreate && errorOnCreate) {
      return "Failed to create tree"; // Changed
    }
    if (isErrorOnAddUsers && errorOnAddUsers) {
      return "Tree created but failed to add users to tree"; // Changed
    }
    return null;
  }, [isErrorOnAddUsers, isErrorOnCreate, errorOnCreate, errorOnAddUsers]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="modalHeader">
        Create New Tree
        <IconButton onClick={onClose} className="closeIcon">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="modalBody">
        <Typography variant="body2" mb={2}>
          Fill in the details below to create a new tree and assign user roles.
        </Typography>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <TextField
          required
          label="Tree Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          fullWidth
          margin="normal"
          disabled={isCreating || isAddingUsers} // Corrected loading state
          error={!!errors.name}
          helperText={errors.name as string}
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          disabled={isCreating || isAddingUsers} // Corrected loading state
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
            (!allUsers || allUsers.length === 0) && (users.length === 0) && (
              <Alert severity="info">No users to assign</Alert>
            )
          )}
          {allUsers &&
            users.map((user, index) => (
              <Box key={index} className="userRow">
                <Autocomplete
                  disabled={isCreating || isAddingUsers} // Corrected loading state
                  options={allUsers.filter((u)=>u.elementId===user.elementId || !users.map(usr=>usr.elementId).includes(u!.elementId!))}
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
                    if (errors.users && (errors.users as string[])[index]) {
                      const newUserErrors = [...(errors.users as string[])];
                      newUserErrors[index] = newUserErrors[index]
                        .replace("User Email is required. ", "")
                        .trim();
                      if (newUserErrors[index] === "")
                        newUserErrors[index] = ""; // Ensure empty string if all specific errors removed
                      setErrors((prev) => ({
                        ...prev,
                        users: newUserErrors.every((err) => err === "")
                          ? []
                          : newUserErrors,
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      required
                      {...params}
                      label="User Email"
                      fullWidth
                      error={
                        !!(
                          errors.users &&
                          (errors.users as string[])[index]?.includes("Email")
                        )
                      }
                      helperText={
                        errors.users &&
                        (errors.users as string[])[index]?.includes("Email")
                          ? (errors.users as string[])[index]
                          : ""
                      }
                    />
                  )}
                  fullWidth
                />
                <FormControl
                  className="roleSelect"
                  required
                  error={
                    !!(
                      errors.users &&
                      (errors.users as string[])[index]?.includes("Role")
                    )
                  }
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={user.role}
                    label="Role"
                    onChange={(e) => {
                      handleChangeUser(index, "role", e.target.value);
                      if (errors.users && (errors.users as string[])[index]) {
                        const newUserErrors = [...(errors.users as string[])];
                        newUserErrors[index] = newUserErrors[index]
                          .replace("User Role is required.", "")
                          .trim();
                        if (newUserErrors[index] === "")
                          newUserErrors[index] = ""; // Ensure empty string if all specific errors removed
                        setErrors((prev) => ({
                          ...prev,
                          users: newUserErrors.every((err) => err === "")
                            ? []
                            : newUserErrors,
                        }));
                      }
                    }}
                    disabled={isCreating || isAddingUsers} // Corrected loading state
                    error={
                      !!(
                        errors.users &&
                        (errors.users as string[])[index]?.includes("Role")
                      )
                    }
                  >
                    <MenuItem value={Role.Admin}>Admin</MenuItem>
                    <MenuItem value={Role.Editor}>Editor</MenuItem>
                    <MenuItem value={Role.Viewer}>Viewer</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  disabled={isCreating || isAddingUsers} // Corrected loading state
                  onClick={() => handleRemoveUser(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
          {/* FormHelperText for overall user errors if not placing them per row */}
          {typeof errors.users === "string" && (
            <FormHelperText error>{errors.users}</FormHelperText>
          )}

          {allUsers && allUsers.length > 0 && (
            <Button
              onClick={handleAddUser}
              variant={(allUsers.length===users.length)? "text" : "outlined"}
              className="addUserBtn"
              disabled={isCreating || isAddingUsers || allUsers.length===users.length} // Corrected loading state
            >
              {(allUsers.length===users.length)? "No more users to add" : "+ Add another user"}
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions className="modalActions">
        <Button disabled={isCreating || isAddingUsers} onClick={onClose}>
          {" "}
          {/* Corrected loading state */}
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isCreating || isAddingUsers} // Ensure button is disabled during loading
          // loading prop on MUI Button typically shows a spinner and handles disabled state
          // but explicit disabled might be needed if not using standard loading indicators
        >
          {(isCreating || isAddingUsers) && (
            <CircularProgress
              size={24}
              sx={{ color: "white", marginRight: 1 }}
            />
          )}
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTree; // Changed
