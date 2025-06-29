// NodeDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react"; // Added useCallback
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
import { MarkerType } from "@xyflow/react"; // Added MarkerType
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
  AppNode, // Added AppNode
} from "@/types/nodeTypes"; // Import NodeFieldDefinition
import { AppEdge, Edges } from "@/types/edgeTypes"; // Added AppEdge and Edges
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
  nodeId: string; // elementId for Supabase path (used as current node's ID)
  mode: "new" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (submission: {
    nodeData: Record<string, any>;
    edgeChanges?: { added: AppEdge[]; removed: { id: string }[] };
  }) => void; // Modified onSubmit
  type?: Nodes;
  initialData?: Record<string, any>;
  nodes: AppNode[]; // NEW: All nodes in the graph
  edges: AppEdge[]; // NEW: All edges in the graph
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
  mode,
  treeId,
  nodeId, // This is the ID of the node being edited, or the new node's ID
  nodes: allNodes, // Renaming for clarity to avoid conflict with 'nodes' variable from reactflow
  edges: allEdges, // Renaming for clarity
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

  // State for relationship autocompletes
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [initialSelectedHouseId, setInitialSelectedHouseId] = useState<
    string | null
  >(null);

  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [initialSelectedChildrenIds, setInitialSelectedChildrenIds] = useState<
    string[]
  >([]);

  const [selectedSpouseId, setSelectedSpouseId] = useState<string | null>(null);
  const [initialSelectedSpouseId, setInitialSelectedSpouseId] = useState<
    string | null
  >(null);

  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [initialSelectedParentIds, setInitialSelectedParentIds] = useState<
    string[]
  >([]);

  // Memoized lists for autocompletes
  const houseNodes = useMemo(
    () => allNodes.filter((node) => node.type === Nodes.House),
    [allNodes]
  );
  const personNodes = useMemo(
    () =>
      allNodes.filter(
        (node) => node.type === Nodes.Person && node.id !== nodeId
      ),
    [allNodes, nodeId]
  );

  useEffect(() => {
    const processData = (data: Record<string, any> | undefined) => {
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
      setFormState(processData(initialData));
    } else {
      setFormState(processData(undefined));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, fields]); // Removed 'type' as 'fields' already depends on it

  useEffect(() => {
    if (
      open &&
      mode === "edit" &&
      nodeId &&
      allNodes.length > 0 &&
      allEdges.length > 0 &&
      type === Nodes.Person
    ) {
      // Reset previous selections to ensure clean state on re-open or if dependencies change
      setSelectedHouseId(null);
      setInitialSelectedHouseId(null);
      setSelectedChildrenIds([]);
      setInitialSelectedChildrenIds([]);
      setSelectedSpouseId(null);
      setInitialSelectedSpouseId(null);
      setSelectedParentIds([]);
      setInitialSelectedParentIds([]);

      const currentNode = allNodes.find((n) => n.id === nodeId);
      if (!currentNode) {
        // Current node must exist for editing
        return;
      }

      // Belongs To (House)
      const belongsToEdge = allEdges.find(
        (edge) =>
          edge.type === Edges.BELONGS_TO &&
          (edge.source === nodeId || edge.target === nodeId)
      );
      if (belongsToEdge) {
        const houseNodeId =
          belongsToEdge.source === nodeId
            ? belongsToEdge.target
            : belongsToEdge.source;
        const houseNode = allNodes.find(
          (n) => n.id === houseNodeId && n.type === Nodes.House
        );
        if (houseNode) {
          setSelectedHouseId(houseNode.id);
          setInitialSelectedHouseId(houseNode.id);
        }
      }

      // Parent Of (Children)
      const children = allEdges
        .filter(
          (edge) => edge.type === Edges.PARENT_OF && edge.source === nodeId
        )
        .map((edge) => edge.target);
      setSelectedChildrenIds(children);
      setInitialSelectedChildrenIds(children);

      // Married To (Spouse)
      const marriageEdge = allEdges.find(
        (edge) =>
          edge.type === Edges.MARRIED_TO &&
          (edge.source === nodeId || edge.target === nodeId)
      );
      if (marriageEdge) {
        const spouseNodeId =
          marriageEdge.source === nodeId
            ? marriageEdge.target
            : marriageEdge.source;
        setSelectedSpouseId(spouseNodeId);
        setInitialSelectedSpouseId(spouseNodeId);
      }

      // Child Of (Parents)
      const parents = allEdges
        .filter(
          (edge) => edge.type === Edges.PARENT_OF && edge.target === nodeId
        )
        .map((edge) => edge.source);
      setSelectedParentIds(parents);
      setInitialSelectedParentIds(parents);
    } else if (mode === "new" || (open && type !== Nodes.Person)) {
      // Reset if new, or if not a Person node
      setSelectedHouseId(null);
      setInitialSelectedHouseId(null);
      setSelectedChildrenIds([]);
      setInitialSelectedChildrenIds([]);
      setSelectedSpouseId(null);
      setInitialSelectedSpouseId(null);
      setSelectedParentIds([]);
      setInitialSelectedParentIds([]);
    }
  }, [open, mode, nodeId, allNodes, allEdges, type]);

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
    setIsProcessing(true);
    if (!validateForm()) {
      setIsProcessing(false);
      return;
    }

    let finalNodeData: Record<string, any> = {
      ...(formState || {}),
      updatedOn: new Date().toISOString(),
    };
    let edgeChanges: { added: AppEdge[]; removed: { id: string }[] } = {
      added: [],
      removed: [],
    };

    // Image handling for Person nodes
    if (type === Nodes.Person && imageState.publicUrl && imageState.isLocal) {
      const actualPath =
        initialData?.imageUrl ||
        `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(nodeId)}`;
      const unsavedPath = `trees/${encodeURIComponent(
        treeId
      )}/${encodeURIComponent(nodeId)}-unsaved`;

      // Check if the current publicUrl is the 'unsaved' path
      // This implies a new image was uploaded or an existing one was changed and processed by cropper.
      // We need to check if imageState.publicUrl corresponds to the unsavedPath after processing by getImage.
      // This check is tricky because publicUrl is a signed URL.
      // A more reliable way is to ensure imagePath from imageState reflects the unsaved supabase path.
      // For now, we assume if isLocal is true, a rename is needed.

      const response = await renameImage(
        unsavedPath, // Source is always the -unsaved path
        actualPath, // Target is the final path
        idToken
      );
      if (response) {
        finalNodeData.imageUrl = actualPath;
      } else {
        // If rename fails, we might still have the -unsaved image.
        // Decide if we want to save with the -unsaved path or clear it.
        // For now, let's assume if rename failed, we don't save an image URL that might become invalid.
        // Or, if the original image was `actualPath` and it wasn't changed, it's fine.
        // This part needs careful consideration of image state transitions.
        // If an image was uploaded, imageState.imagePath should be the -unsaved path.
        // If it was an existing image, and not changed, this rename block shouldn't ideally run.
        // Let's simplify: if isLocal is true, it means an image was processed and is at '-unsaved'.
        finalNodeData.imageUrl = unsavedPath; // Save unsaved path if rename fails, or clear: undefined;
        console.warn(
          "Image rename failed. Saving with unsaved path or clearing. Check logic."
        );
      }
    } else if (
      type === Nodes.Person &&
      !imageState.publicUrl &&
      initialData?.imageUrl
    ) {
      // Image was removed
      finalNodeData.imageUrl = undefined;
    }
    // If imageState.publicUrl exists but isLocal is false, it means it's an existing image that wasn't changed.
    // finalNodeData.imageUrl will already be correct from initialData via formState.

    if (type === Nodes.Person) {
      const defaultMarker = {
        type: MarkerType.Arrow,
        width: 15,
        height: 15,
        color: "#cb4e4e",
      }; // Re-define or import

      // 1. Belongs To (House)
      if (selectedHouseId !== initialSelectedHouseId) {
        if (initialSelectedHouseId) {
          const edgeToRemove = allEdges.find(
            (e) =>
              e.type === Edges.BELONGS_TO &&
              ((e.source === nodeId && e.target === initialSelectedHouseId) ||
                (e.target === nodeId && e.source === initialSelectedHouseId))
          );
          if (edgeToRemove) edgeChanges.removed.push({ id: edgeToRemove.id });
        }
        if (selectedHouseId) {
          edgeChanges.added.push({
            id: `${
              Edges.BELONGS_TO
            }-${nodeId}-${selectedHouseId}-${Date.now()}`,
            source: nodeId,
            target: selectedHouseId,
            type: Edges.BELONGS_TO,
            markerEnd: defaultMarker,
            className: `${Edges.BELONGS_TO}-edge`,
            data: { updatedOn: new Date().toISOString() },
          });
        }
      }

      // 2. Parent Of (Children)
      const childrenToAdd = selectedChildrenIds.filter(
        (id) => !initialSelectedChildrenIds.includes(id)
      );
      const childrenToRemove = initialSelectedChildrenIds.filter(
        (id) => !selectedChildrenIds.includes(id)
      );

      childrenToRemove.forEach((childId) => {
        const edgeToRemove = allEdges.find(
          (e) =>
            e.type === Edges.PARENT_OF &&
            e.source === nodeId &&
            e.target === childId
        );
        if (edgeToRemove) edgeChanges.removed.push({ id: edgeToRemove.id });
      });
      childrenToAdd.forEach((childId) => {
        edgeChanges.added.push({
          id: `${Edges.PARENT_OF}-${nodeId}-${childId}-${Date.now()}`,
          source: nodeId,
          target: childId,
          type: Edges.PARENT_OF,
          markerEnd: defaultMarker,
          className: `${Edges.PARENT_OF}-edge`,
          data: { updatedOn: new Date().toISOString() },
        });
      });

      // 3. Married To (Spouse)
      if (selectedSpouseId !== initialSelectedSpouseId) {
        if (initialSelectedSpouseId) {
          const edgeToRemove = allEdges.find(
            (e) =>
              e.type === Edges.MARRIED_TO &&
              ((e.source === nodeId && e.target === initialSelectedSpouseId) ||
                (e.target === nodeId && e.source === initialSelectedSpouseId))
          );
          if (edgeToRemove) edgeChanges.removed.push({ id: edgeToRemove.id });
        }
        if (selectedSpouseId) {
          edgeChanges.added.push({
            id: `${
              Edges.MARRIED_TO
            }-${nodeId}-${selectedSpouseId}-${Date.now()}`,
            source: nodeId,
            target: selectedSpouseId,
            type: Edges.MARRIED_TO,
            markerEnd: defaultMarker,
            className: `${Edges.MARRIED_TO}-edge`,
            data: { updatedOn: new Date().toISOString() },
          });
        }
      }

      // 4. Child Of (Parents)
      const parentsToAdd = selectedParentIds.filter(
        (id) => !initialSelectedParentIds.includes(id)
      );
      const parentsToRemove = initialSelectedParentIds.filter(
        (id) => !selectedParentIds.includes(id)
      );

      parentsToRemove.forEach((parentId) => {
        const edgeToRemove = allEdges.find(
          (e) =>
            e.type === Edges.PARENT_OF &&
            e.source === parentId &&
            e.target === nodeId
        );
        if (edgeToRemove) edgeChanges.removed.push({ id: edgeToRemove.id });
      });
      parentsToAdd.forEach((parentId) => {
        edgeChanges.added.push({
          id: `${Edges.PARENT_OF}-${parentId}-${nodeId}-${Date.now()}`,
          source: parentId,
          target: nodeId,
          type: Edges.PARENT_OF,
          markerEnd: defaultMarker,
          className: `${Edges.PARENT_OF}-edge`,
          data: { updatedOn: new Date().toISOString() },
        });
      });
    }

    onSubmit({
      nodeData: finalNodeData,
      edgeChanges:
        edgeChanges.added.length > 0 || edgeChanges.removed.length > 0
          ? edgeChanges
          : undefined,
    });
    setIsProcessing(false);
    // onClose will be called by the callback in GraphFlow's onNodeDialogSubmit
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
                        width: "100%",
                      }}
                      container
                    >
                      {field.subFields?.map((subField) => (
                        <Grid sx={{ gridColumn: "span 6" }} key={subField.name}>
                          {subField.name === "jobType" && (
                            <Autocomplete
                              value={
                                formState?.[field.name]?.[subField.name]
                                  ? options.JobTypeOptions.find(
                                      (option) =>
                                        option.label ===
                                        formState[field.name][subField.name]
                                    )
                                  : null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              groupBy={(option) => option.group}
                              getOptionLabel={(option) => option.label}
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              options={options.JobTypeOptions.sort((a, b) =>
                                a.group.localeCompare(b.group)
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select job type"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: {
                                  id: string;
                                  label: string;
                                  group: string;
                                } | null
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
                                formState?.[field.name]?.[subField.name]
                                  ? options.fieldOfStudyOptions.find(
                                      (option) =>
                                        option.label ===
                                        formState[field.name][subField.name]
                                    )
                                  : null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              groupBy={(option) => option.group}
                              getOptionLabel={(option) => option.label}
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              options={options.fieldOfStudyOptions.sort(
                                (a, b) => a.group.localeCompare(b.group)
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select field of study"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: {
                                  id: string;
                                  label: string;
                                  group: string;
                                } | null
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
                                formState?.[field.name]?.[subField.name]
                                  ? options.QualificationOptions.find(
                                      (option) =>
                                        option.label ===
                                        formState[field.name][subField.name]
                                    )
                                  : null
                              }
                              autoComplete
                              autoHighlight
                              fullWidth
                              disablePortal
                              groupBy={(option) => option.group}
                              getOptionLabel={(option) => option.label}
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              options={options.QualificationOptions.sort(
                                (a, b) => a.group.localeCompare(b.group)
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select highest qualification"
                                />
                              )}
                              onChange={(
                                _e,
                                newValue: {
                                  id: string;
                                  label: string;
                                  group: string;
                                } | null
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
                      handleChange(field.name, date ? date.format("DD-MMM-YYYY") : null)
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

            {/* Relationship Autocompletes for Person Node */}
            {type === Nodes.Person && (
              <>
                <Grid sx={{ gridColumn: "span 12", mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                    Relationships
                  </Typography>
                </Grid>

                {/* Belongs To (House) */}
                <Grid sx={{ gridColumn: "span 12" }}>
                  <Autocomplete
                    value={
                      houseNodes.find((h) => h.id === selectedHouseId) || null
                    }
                    onChange={(_event, newValue) => {
                      setSelectedHouseId(newValue ? newValue.id : null);
                    }}
                    options={houseNodes}
                    getOptionLabel={(option) => option.data.name || option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Belongs To (House)" />
                    )}
                    fullWidth
                  />
                </Grid>

                {/* Parent Of (Children) */}
                <Grid sx={{ gridColumn: "span 12" }}>
                  <Autocomplete
                    multiple
                    value={personNodes.filter((p) =>
                      selectedChildrenIds.includes(p.id)
                    )}
                    onChange={(_event, newValues) => {
                      setSelectedChildrenIds(newValues.map((v) => v.id));
                    }}
                    options={personNodes.filter(
                      (p) =>
                        p.id !== nodeId &&
                        !selectedParentIds.includes(p.id) &&
                        p.id !== selectedSpouseId
                    )} // Prevent selecting self, own parents, or spouse as child
                    getOptionLabel={(option) => option.data.name || option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Parent Of (Children)" />
                    )}
                    fullWidth
                  />
                </Grid>

                {/* Married To (Spouse) */}
                <Grid sx={{ gridColumn: "span 12" }}>
                  <Autocomplete
                    value={
                      personNodes.find((p) => p.id === selectedSpouseId) || null
                    }
                    onChange={(_event, newValue) => {
                      setSelectedSpouseId(newValue ? newValue.id : null);
                    }}
                    options={personNodes.filter(
                      (p) =>
                        p.id !== nodeId &&
                        !selectedChildrenIds.includes(p.id) &&
                        !selectedParentIds.includes(p.id)
                    )} // Prevent selecting self, own children, or parents as spouse
                    getOptionLabel={(option) => option.data.name || option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Married To (Spouse)" />
                    )}
                    fullWidth
                  />
                </Grid>

                {/* Child Of (Parents) */}
                <Grid sx={{ gridColumn: "span 12" }}>
                  <Autocomplete
                    multiple
                    value={personNodes.filter((p) =>
                      selectedParentIds.includes(p.id)
                    )}
                    onChange={(_event, newValues) => {
                      if (newValues.length <= 2) {
                        setSelectedParentIds(newValues.map((v) => v.id));
                      }
                    }}
                    options={personNodes.filter(
                      (p) =>
                        p.id !== nodeId &&
                        !selectedChildrenIds.includes(p.id) &&
                        p.id !== selectedSpouseId
                    )} // Prevent selecting self, own children, or spouse as parent
                    getOptionDisabled={(option) =>
                      selectedParentIds.length >= 2 &&
                      !selectedParentIds.includes(option.id)
                    }
                    getOptionLabel={(option) => option.data.name || option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Child Of (Parents - max 2)"
                      />
                    )}
                    fullWidth
                  />
                </Grid>
              </>
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
