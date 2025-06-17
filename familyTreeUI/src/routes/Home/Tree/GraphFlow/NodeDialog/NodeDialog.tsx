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
import { ReactCrop, centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Nodes, nodeFieldsMetadata, NodeFieldDefinition } from "@/types/nodeTypes"; // Import NodeFieldDefinition
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
  const fields: readonly NodeFieldDefinition[] = nodeFieldsMetadata[type]; // Explicitly type fields
  const [formState, setFormState] = useState<Record<string, any> | undefined>(
    initialData
  );
  // const [selectedFile, setSelectedFile] = useState<File | null>(null); // Removed unused state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);


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

  // Helper function to generate cropped image
  function getCroppedImg(image: HTMLImageElement, localCrop: PixelCrop, fileName: string): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = localCrop.width;
    canvas.height = localCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.resolve(null);
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = localCrop.width * pixelRatio;
    canvas.height = localCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      localCrop.x * scaleX,
      localCrop.y * scaleY,
      localCrop.width * scaleX,
      localCrop.height * scaleY,
      0,
      0,
      localCrop.width,
      localCrop.height
    );
    
    // For circular crop, clip the canvas
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(localCrop.width / 2, localCrop.height / 2, localCrop.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            resolve(null);
            return;
          }
          const file = new File([blob], fileName, { type: 'image/png' });
          resolve(file);
        },
        'image/png',
        1
      );
    });
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, 
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
    return false; 
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCrop(undefined); // Reset crop when new file is selected
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(event.target.files[0]);
      // setSelectedFile(null); // Removed: selectedFile state is removed
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

  const handleImageUpload = async () => {
    if (!croppedImageFile || !nodeId) {
      return null;
    }
    setIsUploading(true);
    await signInWithGoogleToken();
    const path = await uploadImage(croppedImageFile, treeId, nodeId);
    if (!path) {
      setIsUploading(false);
      // Potentially revert imageUrl if it was a blob URL or show error
      return null;
    }

    const publicUrl = await getImageUrl(treeId, nodeId);
    // console.log("publicUrl", publicUrl); // Removed console.log
    setFormState((prev) => ({ ...prev, imageUrl: publicUrl }));
    setIsUploading(false);
    setCroppedImageFile(null); 
    return publicUrl;
  };

  const handleCropConfirm = async () => {
    if (completedCrop && imgRef.current) {
      // Use a unique name for the cropped file to avoid caching issues if desired
      const fileName = `cropped_${Date.now()}.png`;
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop, fileName);
      if (croppedFile) {
        setCroppedImageFile(croppedFile);
        // Revoke previous blob URL if it exists to free up memory
        if (formState?.imageUrl && formState.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(formState.imageUrl);
        }
        setFormState(prev => ({ ...prev, imageUrl: URL.createObjectURL(croppedFile) }));
      }
      setShowCropper(false);
      setImgSrc('');
      // Ensure the file input is cleared so the same file can be chosen again if needed
      const fileInput = document.getElementById('person-image-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImgSrc('');
    // Ensure the file input is cleared
    const fileInput = document.getElementById('person-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async () => {
    let currentFormState = { ...formState };

    if (type === Nodes.Person && croppedImageFile && nodeId) {
      const uploadedImageUrl = await handleImageUpload();
      if (uploadedImageUrl) {
        currentFormState = { ...currentFormState, imageUrl: uploadedImageUrl };
      } else {
        console.error("Image upload failed after crop. Submission might use a local blob URL or the previous image URL.");
        // Decide if we should revert to initialData.imageUrl or allow blob for now
        // For this implementation, if upload fails, the blob URL might persist in currentFormState
        // or we could explicitly revert:
        // currentFormState = { ...currentFormState, imageUrl: initialData?.imageUrl || '' };
      }
    }
    // Clean up blob URL before submitting if it hasn't been uploaded.
    // However, onSubmit might be called with a blob URL if upload failed and we didn't revert.
    // This cleanup is best done in onClose or when a new image is selected/upload succeeds.
    onSubmit(currentFormState ?? {});
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

    {/* Cropper Dialog */}
    <Dialog open={showCropper} onClose={handleCropCancel} fullWidth maxWidth="xs">
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop={true}
            minWidth={50} // Example: set min crop dimensions
            minHeight={50}
          >
            <img
              ref={imgRef} 
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ maxHeight: '60vh', width: 'auto', objectFit: 'contain' }}
            />
          </ReactCrop>
        )}
        {!imgSrc && <Typography>No image selected or an error occurred.</Typography>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="text" onClick={handleCropCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCropConfirm} disabled={!completedCrop || !imgSrc}>
          Confirm Crop
        </Button>
      </DialogActions>
    </Dialog>
  </LocalizationProvider>
  );
};
