// NodeDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Input,
  Box,
  Typography,
} from "@mui/material";
import { Nodes, nodeFieldsMetadata } from "@/types/nodeTypes";
import { supabase } from "@/config/supabaseClient";
import { getImageUrl, uploadImage } from "@/routes/common/imageStorage";
import { useAuth } from "@/hooks/useAuth";

type NodeDialogProps = {
  treeId: string;
  nodeId: string; // elementId for Supabase path
  mode: "new" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void; // Allow any for imageUrl
  type?: Nodes;
  initialData?: Record<string, any>; // Allow any for imageUrl
};

export const NodeDialog: React.FC<NodeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type = Nodes.Person,
  initialData,
  treeId,
  nodeId,
}) => {
  const { idToken } = useAuth();
  const fields = nodeFieldsMetadata[type];
  const [formState, setFormState] = useState<Record<string, any> | undefined>(
    initialData
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const signInWithGoogleToken = async () => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken ?? "",
    });
    if (error) console.error("Supabase sign-in failed:", error.message);
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !nodeId) {
      // Consider showing an error to the user
      return null;
    }
    setIsUploading(true);
    await signInWithGoogleToken();
    // Upsert true to overwrite if file with same name exists, useful for updates
    const path = await uploadImage(selectedFile, treeId, nodeId);
    if (!path) setIsUploading(false);

    const publicUrl = await getImageUrl(treeId, nodeId);
    console.log("publicUrl", publicUrl);
    setFormState((prev) => ({ ...prev, imageUrl: publicUrl }));
    setIsUploading(false);
    setSelectedFile(null); // Clear selected file after successful upload
    return publicUrl;
  };

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    let currentFormState = { ...formState };

    if (type === Nodes.Person && selectedFile && nodeId) {
      const uploadedImageUrl = await handleImageUpload();
      if (uploadedImageUrl) {
        currentFormState = { ...currentFormState, imageUrl: uploadedImageUrl };
      } else {
        // Handle upload failure, e.g., by not submitting or notifying user
        console.error("Image upload failed, submission might be affected.");
        // Optionally, prevent submission:
        // onClose(); // or some error display
        // return;
      }
    }
    onSubmit(currentFormState ?? {});
  };
  const getDefaultValueType = (type: Nodes, name: string) => {
    const field = nodeFieldsMetadata[type].find(
      (attribute) => attribute.name === name
    );
    return field?.default;
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
          {fields?.map((field) => (
            <Grid sx={{ gridColumn: "span 6" }} key={field.name}>
              <TextField
                required={field.required}
                label={field.label}
                value={
                  formState && formState[field.name]
                    ? formState[field.name]
                    : getDefaultValueType(type, field.name)
                }
                onChange={(e) => handleChange(field.name, e.target.value)}
                fullWidth
              />
            </Grid>
          ))}
          {type === Nodes.Person && (
            <Grid sx={{ gridColumn: "span 12" }}>
              <Input
                type="file"
                onChange={handleFileChange}
                fullWidth
                disabled={isUploading}
                inputProps={{ accept: "image/*" }} // Suggest only image files
              />
              {isUploading && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Uploading image...
                </Typography>
              )}
              {/* Display current image or preview */}
              {formState?.imageUrl && !selectedFile && (
                <Box mt={1}>
                  <Typography variant="caption">Current image:</Typography>
                  <img
                    src={formState.imageUrl}
                    alt="Current person"
                    style={{
                      width: "100px",
                      height: "auto",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              )}
              {selectedFile && (
                <Box mt={1}>
                  <Typography variant="caption">Image preview:</Typography>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected preview"
                    style={{
                      width: "100px",
                      height: "auto",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
