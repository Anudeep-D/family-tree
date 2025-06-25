// NodeDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
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
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
// Removed ReactCrop imports, will be in CropperDialog.tsx
import "react-image-crop/dist/ReactCrop.css"; // Keep CSS for global styles if necessary, or move if specific
import {
  Nodes,
  nodeFieldsMetadata,
  NodeFieldDefinition,
} from "@/types/nodeTypes"; // Import NodeFieldDefinition
import {
  getImage,
  renameImage,
  uploadImageWithUrl,
} from "@/routes/common/imageStorage";
import CropperDialog from "./CropperDialog";
import { useAuth } from "@/hooks/useAuth";
import options from "@/constants/JobAndQualification.json";
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

type ImageStateProps = {
  publicUrl: string | undefined;
  imagePath: string | undefined;
  isLocal: boolean;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const fields: readonly NodeFieldDefinition[] = useMemo(() => {
    const allFields = type ? nodeFieldsMetadata[type] : [];
    return allFields.filter((field) => field.isField);
  }, [type]);
  const [formState, setFormState] = useState<Record<string, any> | undefined>(
    initialData
  );
  const [imageState, setImageState] = useState<ImageStateProps>({
    publicUrl: undefined,
    imagePath: initialData && initialData["imageUrl"],
    isLocal: false,
  });
  // const [selectedFile, setSelectedFile] = useState<File | null>(null); // Removed unused state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgSrc, setImgSrc] = useState<string>("");
  // crop, completedCrop, croppedImageFile, showCropper, imgRef are moved to CropperDialog
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);

  useEffect(() => {
    const processData = (
      data: Record<string, any> | undefined,
      isInitial: boolean
    ) => {
      const resultState: Record<string, any> = {};
      fields.forEach((field) => {
        const hasProperty = data?.hasOwnProperty(field.name);
        if (field.type === "jobObject" || field.type === "educationObject") {
          resultState[field.name] =
            (hasProperty ? data?.[field.name] : undefined) ?? {};
        } else if (field.type === "date") {
          const fieldValue = hasProperty ? data?.[field.name] : field.default;
          if (fieldValue && typeof fieldValue === "string") {
            resultState[field.name] = dayjs(fieldValue);
          } else if (fieldValue) {
            resultState[field.name] = fieldValue; // Already a Dayjs object or null/undefined
          } else {
            resultState[field.name] = null; // Default for date if no value/default
          }
        } else if (field.type === "boolean") {
          resultState[field.name] = hasProperty
            ? data?.[field.name]
            : field.default ?? false;
        } else {
          resultState[field.name] = hasProperty
            ? data?.[field.name]
            : field.default;
        }
      });
      return resultState;
    };

    if (initialData) {
      setFormState(processData(initialData, true));
    } else {
      setFormState(processData(undefined, false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, fields]); // Removed 'type' as 'fields' already depends on it

  const setPublicUrl = async (url: string, isLocal: boolean) => {
    const publicUrl = await getImage(url);
    setImageState((prev) => ({
      ...prev,
      publicUrl: publicUrl ?? undefined,
      isLocal: isLocal,
    }));
  };
  useEffect(() => {
    if (initialData?.hasOwnProperty("imageUrl")) {
      setPublicUrl(initialData["imageUrl"], false);
    }
  }, [initialData]);
  // getCroppedImg, onImageLoad, handleCropConfirm, handleCropCancel are moved to CropperDialog.tsx

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setCropperOpen(true); // Open the new CropperDialog
      });
      reader.readAsDataURL(event.target.files[0]);
      // Clear the input value to allow selecting the same file again if needed
      event.target.value = "";
    }
  };

  // Modified to accept a File argument
  const handleImageUpload = async (croppedFile: File) => {
    if (croppedFile && nodeId) {
      const path = await uploadImageWithUrl(
        croppedFile,
        `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(
          nodeId
        )}-unsaved`,
        idToken
      );
      return path;
    }
    return null;
  };

  // New handler for when CropperDialog confirms
  const handleCropperConfirm = async (file: File) => {
    setCropperOpen(false);
    setImgSrc(""); // Clear imgSrc as it's no longer needed
    setIsUploading(true); // Ensure session is active
    // Automatically start the upload process
    const path = await handleImageUpload(file);
    path &&
      setPublicUrl(
        `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(
          nodeId
        )}-unsaved`,
        true
      );
    // Ensure the file input is cleared so the same file can be chosen again if needed
    const fileInput = document.getElementById(
      "person-image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    setIsUploading(false);
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    setImgSrc("");
    // Ensure the file input is cleared
    const fileInput = document.getElementById(
      "person-image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChange = (key: string, value: any, subFieldKey?: string) => {
    setFormState((prevFormState) => {
      let newState;
      if (subFieldKey) {
        newState = {
          ...prevFormState,
          [key]: {
            ...(prevFormState?.[key] as Record<string, any>), // Type assertion
            [subFieldKey]: value,
          },
        };
      } else {
        newState = { ...prevFormState, [key]: value };
      }

      // If 'isAlive' is changed to 'Yes', clear 'doe'
      if (key === "isAlive" && value === "Yes") {
        newState.doe = null; // Or undefined, depending on how you want to handle it
      }
      return newState;
    });
    // Clear error for the main field or subfield.
    // For subfields, errors might be stored like "job.jobTitle". This needs consideration.
    // For now, only clearing top-level errors.
    if (!subFieldKey) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    } else {
      // If we decide to store subfield errors like "job.jobTitle", this needs adjustment.
      // For now, clearing the parent field's error, or a specific subfield error if structured that way.
      setErrors((prev) => ({
        ...prev,
        [`${key}.${subFieldKey}`]: "",
        [key]: "",
      })); // Clear both specific and parent
    }
  };

  const handleSubmit = async () => {
    // Image upload is now handled by handleCropperConfirm -> hdlImageUpload.
    // handleSubmit will just use the imageUrl from formState, which should be the Supabase URL if upload was successful.
    // If upload failed, formState.imageUrl might be the initial URL or empty.
    // It's important that hdlImageUpload correctly sets formState.imageUrl upon failure.

    // Ensure any lingering blob URL is revoked if it wasn't uploaded.
    // This is a fallback, ideally hdlImageUpload manages this.
    if (type === Nodes.Person && imageState.isLocal) {
      const actualPath =
        initialData?.imageUrl ||
        `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(nodeId)}`;
      const response = await renameImage(
        `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(
          nodeId
        )}-unsaved`,
        actualPath,
        idToken
      );
      if (response) {
        setFormState((prev) => ({
          ...prev,
          imageUrl: actualPath,
          updatedOn: Date(),
        }));
        onSubmit({ ...formState, imageUrl: actualPath, updatedOn: Date() });
      } else {
        onSubmit({ ...formState, updatedOn: Date() });
      }
    } else {
      onSubmit({ ...formState, updatedOn: Date() });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    fields?.forEach((field) => {
      if (field.required) {
        const value = formState?.[field.name];
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (typeof value === "boolean" && !value && field.type === "boolean")
        ) {
          newErrors[field.name] = "This field is required";
          isValid = false;
        }
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const getDefaultValueType = (
    fieldType: string | readonly string[],
    name: string,
    currentType: Nodes
  ) => {
    const field = nodeFieldsMetadata[currentType].find(
      (attribute) => attribute.name === name
    );
    if (fieldType === "date") {
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
              if (
                (field.name === "doe" && formState?.isAlive !== "No") ||
                field.name === "imageUrl"
              ) {
                return null; // Don't render 'doe' field if isAlive is not 'No'
              }

              const commonProps = {
                key: field.name,
                label: field.label,
                error: !!errors[field.name],
                helperText: errors[field.name],
              };
              const value =
                formState?.[field.name] ??
                getDefaultValueType(field.type, field.name, type);

              let inputComponent;
              if (
                field.type === "jobObject" ||
                field.type === "educationObject"
              ) {
                inputComponent = (
                  <Grid
                    container
                    sx={{ gridColumn: "span 12" }}
                    key={field.name}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      {field.label}
                    </Typography>
                    <Grid
                      columns={12}
                      columnSpacing={2}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(12, 1fr)",
                        gap: 2,
                        width: "100%"
                      }}
                      container
                    >
                      {field.subFields?.map((subField) => (
                        <Grid sx={{ gridColumn: "span 6" }} key={subField.name}>
                          {subField.name === "jobType" && (
                            <Autocomplete
                              value={
                                formState?.[field.name]?.[subField.name] ?? null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              options={options.JobTypeOptions}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select job type"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: { id: string; label: string } | null
                              ) =>
                                handleChange(
                                  field.name,
                                  newValue?.label,
                                  subField.name
                                )
                              }
                            />
                          )}
                          {subField.name === "fieldOfStudy" && (
                            <Autocomplete
                              value={
                                formState?.[field.name]?.[subField.name] ?? null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              options={options.fieldOfStudyOptions}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select field of study"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: { id: string; label: string } | null
                              ) =>
                                handleChange(
                                  field.name,
                                  newValue?.label,
                                  subField.name
                                )
                              }
                            />
                          )}
                          {subField.name === "highestQualification" && (
                            <Autocomplete
                              value={
                                formState?.[field.name]?.[subField.name] ?? null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              options={options.QualificationOptions}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select highest qualification"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: { id: string; label: string } | null
                              ) =>
                                handleChange(
                                  field.name,
                                  newValue?.label,
                                  subField.name
                                )
                              }
                            />
                          )}
                          {![
                            "highestQualification",
                            "fieldOfStudy",
                            "jobType",
                          ].includes(subField.name) && (
                            <TextField
                              label={subField.label}
                              required={subField.required}
                              value={
                                formState?.[field.name]?.[subField.name] ?? ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.name,
                                  e.target.value,
                                  subField.name
                                )
                              }
                              fullWidth
                              slotProps={{
                                inputLabel: {
                                  shrink: Boolean(
                                    formState?.[field.name]?.[subField.name] ||
                                      formState?.[field.name]?.[
                                        subField.name
                                      ] === ""
                                  ),
                                },
                              }}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                );
              } else if (field.type === "string") {
                // Ensure displayValue is always a string for TextField's value prop
                const displayValue = value ?? "";
                // Determine if the field has a meaningful value to make the label shrink
                const hasValue = displayValue !== "";

                inputComponent = (
                  <TextField
                    {...commonProps} // Contains label, error, helperText
                    required={field.required}
                    value={displayValue}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    fullWidth
                    // Explicitly control label shrink behavior.
                    InputLabelProps={{ shrink: hasValue }}
                  />
                );
              } else if (field.type === "boolean") {
                inputComponent = (
                  <FormControl fullWidth error={!!errors[field.name]}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!value}
                          onChange={(e) =>
                            handleChange(field.name, e.target.checked)
                          }
                          name={field.name}
                        />
                      }
                      label={field.label}
                    />
                    {errors[field.name] && (
                      <FormHelperText>{errors[field.name]}</FormHelperText>
                    )}
                  </FormControl>
                );
              } else if (field.type === "date") {
                inputComponent = (
                  <DatePicker
                    label={field.label}
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      handleChange(field.name, date ? date.toISOString() : null)
                    }
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
                  <FormControl
                    fullWidth
                    required={field.required}
                    error={!!errors[field.name]}
                  >
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={value ?? ""}
                      label={field.label}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                      {/* Ensure field.type is treated as a mutable array of strings for mapping */}
                      {[...(field.type as readonly string[])].map(
                        (option: string) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        )
                      )}
                    </Select>
                    {errors[field.name] && (
                      <FormHelperText>{errors[field.name]}</FormHelperText>
                    )}
                  </FormControl>
                );
              }

              // For jobObject/educationObject, the component is already wrapped in a full-width Grid
              if (
                field.type === "jobObject" ||
                field.type === "educationObject"
              ) {
                return inputComponent; // This is already a <Grid> element spanning 12 columns
              } else {
                return (
                  <Grid sx={{ gridColumn: "span 6" }} key={field.name}>
                    {inputComponent}
                  </Grid>
                );
              }
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
                {imageState.publicUrl && (
                  <Box
                    mt={2}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" sx={{ mb: 0.5 }}>
                      Image Preview:
                    </Typography>
                    <img
                      src={imageState.publicUrl}
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
          <Button disabled={isProcessing} variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            loading={isProcessing}
            onClick={async () => {
              setIsProcessing(true);
              if (validateForm()) {
                await handleSubmit();
              }
              setIsProcessing(false);
            }}
          >
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
