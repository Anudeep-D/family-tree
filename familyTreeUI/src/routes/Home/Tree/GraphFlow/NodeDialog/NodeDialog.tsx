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
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  // Switch, // Removed unused import
  FormHelperText,
  FormControlLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
// Removed ReactCrop imports, will be in CropperDialog.tsx
import 'react-image-crop/dist/ReactCrop.css'; // Keep CSS for global styles if necessary, or move if specific
import { Nodes, nodeFieldsMetadata, NodeFieldDefinition } from "@/types/nodeTypes"; // Import NodeFieldDefinition
import { supabase } from "@/config/supabaseClient";
import { getImageUrl, uploadImage } from "@/routes/common/imageStorage";
import { useAuth } from "@/hooks/useAuth";
import CropperDialog from "./CropperDialog";

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
  const fields: readonly NodeFieldDefinition[] = nodeFieldsMetadata[type]; // Explicitly type fields
  const [formState, setFormState] = useState<Record<string, any> | undefined>(
    initialData
  );
  // const [selectedFile, setSelectedFile] = useState<File | null>(null); // Removed unused state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgSrc, setImgSrc] = useState<string>('');
  // crop, completedCrop, croppedImageFile, showCropper, imgRef are moved to CropperDialog
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);


  useEffect(() => {
    if (initialData) {
      const processedInitialData: Record<string, any> = {};
      fields.forEach((field) => { // field is now NodeFieldDefinition
        if (initialData.hasOwnProperty(field.name)) {
          if (field.type === 'date' && initialData[field.name] && typeof initialData[field.name] === 'string') {
            processedInitialData[field.name] = dayjs(initialData[field.name]);
          } else {
            processedInitialData[field.name] = initialData[field.name];
          }
        } else { // If initialData doesn't have a field defined in 'fields', initialize with default
          if (field.type === 'date' && typeof field.default === 'string') {
            processedInitialData[field.name] = dayjs(field.default);
          } else if (field.type === 'boolean' && typeof field.default === 'undefined') {
            processedInitialData[field.name] = false;
          } else {
            processedInitialData[field.name] = field.default;
          }
        }
      });
      setFormState(processedInitialData);
    } else {
      // Initialize form with default values
      const defaultState: Record<string, any> = {};
      fields.forEach((field) => { // field is now NodeFieldDefinition
        if (field.type === 'date' && typeof field.default === 'string') {
          defaultState[field.name] = dayjs(field.default);
        } else if (field.type === 'boolean' && typeof field.default === 'undefined') {
          defaultState[field.name] = false;
        } else {
          defaultState[field.name] = field.default;
        }
      });
      setFormState(defaultState);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, type, fields]); // 'type' is a dependency for 'fields', 'fields' itself is stable if type doesn't change.

  // getCroppedImg, onImageLoad, handleCropConfirm, handleCropCancel are moved to CropperDialog.tsx

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setCropperOpen(true); // Open the new CropperDialog
      });
      reader.readAsDataURL(event.target.files[0]);
      // Clear the input value to allow selecting the same file again if needed
      event.target.value = "";
    }
  };

  const signInWithGoogleToken = async () => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken ?? "",
    });
    if (error) console.error("Supabase sign-in failed:", error.message);
  };

  // Modified to accept a File argument
  const handleImageUpload = async (croppedFile: File) => {
    if (!croppedFile || !nodeId) {
      // If no file is provided (e.g. user cancels crop after selecting),
      // ensure imageUrl is not a lingering blob from a previous crop.
      // This might need more robust handling based on desired UX.
      if (formState?.imageUrl && formState.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formState.imageUrl);
        setFormState(prev => ({ ...prev, imageUrl: initialData?.imageUrl || '' }));
      }
      return null;
    }
    setIsUploading(true);
    await signInWithGoogleToken(); // Ensure session is active
    const path = await uploadImage(croppedFile, treeId, nodeId);
    
    // Clean up the blob URL after upload attempt (success or fail)
    if (formState?.imageUrl && formState.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formState.imageUrl);
    }

    if (!path) {
      setIsUploading(false);
      // Revert to initial image or clear if upload failed
      setFormState((prev) => ({ ...prev, imageUrl: initialData?.imageUrl || '' }));
      return null;
    }

    const publicUrl = await getImageUrl(treeId, nodeId);
    setFormState((prev) => ({ ...prev, imageUrl: publicUrl }));
    setIsUploading(false);
    return publicUrl;
  };
  
  // New handler for when CropperDialog confirms
  const handleCropperConfirm = async (file: File) => {
    if (formState?.imageUrl && formState.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formState.imageUrl); // Revoke old blob URL
    }
    setFormState(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) })); // Show preview
    setCropperOpen(false);
    setImgSrc(''); // Clear imgSrc as it's no longer needed
    
    // Automatically start the upload process
    await handleImageUpload(file); 
        // Ensure the file input is cleared so the same file can be chosen again if needed
    const fileInput = document.getElementById('person-image-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    setImgSrc('');
    // Ensure the file input is cleared
    const fileInput = document.getElementById('person-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormState((prevFormState) => {
      const newState = { ...prevFormState, [key]: value };
      // If 'isAlive' is changed to 'Yes', clear 'doe'
      if (key === 'isAlive' && value === 'Yes') {
        newState.doe = null; // Or undefined, depending on how you want to handle it
      }
      return newState;
    });
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async () => {
    // Image upload is now handled by handleCropperConfirm -> handleImageUpload.
    // handleSubmit will just use the imageUrl from formState, which should be the Supabase URL if upload was successful.
    // If upload failed, formState.imageUrl might be the initial URL or empty.
    // It's important that handleImageUpload correctly sets formState.imageUrl upon failure.
    
    // Ensure any lingering blob URL is revoked if it wasn't uploaded.
    // This is a fallback, ideally handleImageUpload manages this.
    if (formState?.imageUrl && formState.imageUrl.startsWith('blob:') && !isUploading) {
        URL.revokeObjectURL(formState.imageUrl);
        // Decide what the imageUrl should be if a blob was present but not uploaded by submit time
        setFormState(prev => ({ ...prev, imageUrl: initialData?.imageUrl || '' }));
        onSubmit({ ...formState, imageUrl: initialData?.imageUrl || '' });
    } else {
        onSubmit(formState ?? {});
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    fields?.forEach(field => {
      if (field.required) {
        const value = formState?.[field.name];
        if (value === null || value === undefined || value === '' || (typeof value === 'boolean' && !value && field.type === 'boolean')) {
          newErrors[field.name] = 'This field is required';
          isValid = false;
        }
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const getDefaultValueType = (fieldType: string | readonly string[], name: string, currentType: Nodes) => {
    const field = nodeFieldsMetadata[currentType].find(
      (attribute) => attribute.name === name
    );
    if (fieldType === 'date') {
      return field?.default ? dayjs(field.default as string) : null;
    }
    return field?.default;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            {fields?.map((field) => {
              // Conditional rendering for 'doe' field
              if (field.name === 'doe' && formState?.isAlive !== 'No') {
                return null; // Don't render 'doe' field if isAlive is not 'No'
              }

              const commonProps = {
                key: field.name,
                label: field.label,
                error: !!errors[field.name],
                helperText: errors[field.name],
              };
              const value = formState?.[field.name] ?? getDefaultValueType(field.type, field.name, type);

              let inputComponent;
              if (field.type === "string") {
                inputComponent = (
                  <TextField
                    {...commonProps}
                    required={field.required}
                    value={value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    fullWidth
                  />
                );
              } else if (field.type === "boolean") {
                inputComponent = (
                  <FormControl fullWidth error={!!errors[field.name]}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!value}
                          onChange={(e) => handleChange(field.name, e.target.checked)}
                          name={field.name}
                        />
                      }
                      label={field.label}
                    />
                    {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
                  </FormControl>
                );
              } else if (field.type === "date") {
                inputComponent = (
                  <DatePicker
                    label={field.label}
                    value={value ? dayjs(value) : null}
                    onChange={(date) => handleChange(field.name, date ? date.toISOString() : null)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: field.required,
                        error: !!errors[field.name],
                        helperText: errors[field.name],
                      },
                    }}
                  />
                );
              } else if (Array.isArray(field.type)) {
                inputComponent = (
                  <FormControl fullWidth required={field.required} error={!!errors[field.name]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={value}
                      label={field.label}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                      {/* Ensure field.type is treated as a mutable array of strings for mapping */}
                      {([...(field.type as readonly string[])]).map((option: string) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
                  </FormControl>
                );
              }

              return (
                <Grid sx={{ gridColumn: "span 6" }} key={field.name}>
                  {inputComponent}
                </Grid>
              );
            })}
            {type === Nodes.Person && (
              <Grid sx={{ gridColumn: "span 12" }}>
              <Input
                id="person-image-upload" // Added ID here
                type="file"
                onChange={handleFileChange}
                fullWidth
                disabled={isUploading}
                inputProps={{ accept: "image/*" }} 
              />
              {isUploading && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Uploading image...
                </Typography>
              )}
              {/* Display current image (either from initialData, cropped preview, or uploaded URL) */}
              {formState?.imageUrl && (
                <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mb: 0.5 }}>Image Preview:</Typography>
                  <img
                    src={formState.imageUrl}
                    alt="Person"
                    style={{
                      width: "100px",
                      height: "100px", 
                      border: "1px solid #ddd",
                      borderRadius: "50%", 
                      objectFit: "cover", 
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
        <Button variant="contained" onClick={() => {
          if (validateForm()) {
            handleSubmit();
          }
        }}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* New Cropper Dialog Integration */}
    <CropperDialog
      open={cropperOpen}
      onClose={handleCropperClose}
      onConfirm={handleCropperConfirm}
      imgSrc={imgSrc}
      nodeId={nodeId}
      treeId={treeId}
    />
  </LocalizationProvider>
  );
};
