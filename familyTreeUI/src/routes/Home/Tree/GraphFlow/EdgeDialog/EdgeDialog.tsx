// EdgeDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel,
  FormControl,
  Box,
  FormHelperText,
  // Potentially Checkbox, FormControlLabel, Switch if boolean types are added to edges
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { edgeFieldTemplates, Edges, EdgeField } from "@/types/edgeTypes"; // Import EdgeField

type EdgeDialogProps = {
  mode: "new" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (type: Edges, data: Record<string, string>) => void;
  type?: Edges;
  initialData?: Record<string, any>; // Allow 'any' for initialData due to potential dayjs objects
};

export const EdgeDialog: React.FC<EdgeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  initialData,
}) => {
  const [edgeType, setEdgeType] = useState(type);
  
  const fields: readonly EdgeField[] = useMemo(() => {
    return edgeType ? edgeFieldTemplates[edgeType] : [];
  }, [edgeType]);

  const [formState, setFormState] = useState<Record<string, any> | undefined>(
    initialData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // No need for currentFields, 'fields' is already correctly typed and available
    if (initialData) {
      const processedData: Record<string, any> = {};
      // Ensure we only process fields relevant to the current edgeType
      fields.forEach(field => {
        if (initialData.hasOwnProperty(field.name)) { // Check if initialData has this field
          if (field.type === 'date' && initialData[field.name] && typeof initialData[field.name] === 'string') {
            processedData[field.name] = dayjs(initialData[field.name]);
          } else {
            // Assigns value directly if not a date string or if it's already processed (e.g. dayjs object)
            processedData[field.name] = initialData[field.name];
          }
        } else {
           // If initialData doesn't have a field defined in 'fields' (e.g. new field added to template),
           // initialize with default from template.
           if (field.type === 'date' && field.default) {
            processedData[field.name] = dayjs(field.default as string);
          } else if (field.type === 'boolean' && typeof field.default === 'undefined') {
            processedData[field.name] = false;
          } else {
            processedData[field.name] = field.default;
          }
        }
      });
      setFormState(processedData);
    } else {
      const defaultState: Record<string, any> = {};
      fields.forEach(field => { // field is now correctly typed as EdgeField
        if (field.type === 'date' && field.default) {
          defaultState[field.name] = dayjs(field.default as string);
        } else if (field.type === 'boolean' && typeof field.default === 'undefined') {
          defaultState[field.name] = false; 
        } else {
          defaultState[field.name] = field.default;
        }
      });
      setFormState(defaultState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [initialData, edgeType, fields]); // 'fields' is correctly in dependency array.

  const handleChange = (key: string, value: any) => {
    // For DatePicker, value is a dayjs object. Store its ISO string or null.
    // For Checkbox, value is event.target.checked (boolean)
    // For Select/TextField, value is event.target.value (string)
    let processedValue = value;
    const fieldDefinition = fields.find(f => f.name === key);

    if (fieldDefinition?.type === 'date') {
      processedValue = value ? (value as dayjs.Dayjs).toISOString() : null;
    }
    // if fieldDefinition is boolean, `value` is already the boolean state from checkbox's onChange.
    
    setFormState((prev) => ({ ...prev, [key]: processedValue }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    if (!edgeType) {
        // Or handle this scenario appropriately, maybe disable submit if no type
        return false; 
    }
    // 'fields' is already the current fields for the edgeType.
    fields.forEach(field => { // field is EdgeField here
      if (field.required) {
        const value = formState?.[field.name];
        if (value === null || value === undefined || value === '' || (field.type === 'boolean' && value === false)) { // Added check for boolean required
          newErrors[field.name] = `${field.label} is required`;
          isValid = false;
        }
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    // Ensure date objects are converted to ISO strings before submission if not already
    // The handleChange for 'date' type already stores them as ISO strings.
    onSubmit(edgeType!, formState ?? {});
    // Consider clearing form or specific fields after successful submission if needed, or handle in parent via onClose
  };

  const handleSelect = (event: SelectChangeEvent) => {
    setEdgeType(event.target.value as Edges | undefined);
    setFormState({}); // Reset form state when edge type changes
    setErrors({});   // Reset errors as well
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box component="span" sx={{ whiteSpace: "nowrap" }}>
            {initialData ? "Edit Edge" : "Add New Edge"}
          </Box>
          <FormControl
            required
            size="small"
            sx={{ minWidth: 160, width: "auto", flexShrink: 0 }}
            disabled={!!initialData} // Disable type change when editing
          >
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={edgeType ?? ""}
              label="Type"
              onChange={handleSelect}
              disabled={!!initialData} // Disable type change when editing
            >
              {/* <MenuItem value={undefined}>None</MenuItem> */} {/* Consider if "None" is a valid state or if a type must always be selected for a new edge */}
              <MenuItem value={Edges.BELONGS_TO}>{Edges.BELONGS_TO}</MenuItem>
              <MenuItem value={Edges.PARENT_OF}>{Edges.PARENT_OF}</MenuItem>
              <MenuItem value={Edges.MARRIED_TO}>{Edges.MARRIED_TO}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          columns={12}
          columnSpacing={2}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 2,
            pt: 1, // Add some padding top for better spacing from title
          }}
        >
          {fields?.map((field) => {
            const value = formState?.[field.name] ?? ''; // Default to empty string or appropriate default
            let inputComponent;

            if (field.type === "string") {
              inputComponent = (
                <TextField
                  label={field.label}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  fullWidth
                  required={field.required}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              );
            } else if (field.type === "date") {
              // When rendering DatePicker, ensure `value` is a dayjs object or null
              const dateValue = value ? dayjs(value) : null;
              inputComponent = (
                <DatePicker
                  label={field.label}
                  value={dateValue}
                  onChange={(date) => handleChange(field.name, date)} // Pass dayjs object or null
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
            } else if (Array.isArray(field.type)) { // Enum / Select
              inputComponent = (
                <FormControl fullWidth required={field.required} error={!!errors[field.name]}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={value}
                    label={field.label}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    {(field.type as string[]).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
                </FormControl>
              );
            }
            // Add more types like boolean with Checkbox if needed:
            // else if (field.type === "boolean") { ... }

            return (
              <Grid sx={{ gridColumn: "span 6" }} key={field.name}>
                {inputComponent}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!edgeType} // Keep disabled if no edgeType is selected
          variant="contained"
          onClick={handleSubmit}
        >
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  </LocalizationProvider>
  );
};
