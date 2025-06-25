import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Divider,
  Button,
  Stack,
  Paper,
  Switch,
} from "@mui/material";
import { forwardRef, useState } from "react";

export type FiltersPopperProps = {
  houseOptions: string[];
  personOptions: string[];
  savedFilters: string[];
  onSaveAsNew: () => void;
  onUpdate: () => void;
  onApplyFilters: () => void;
};

const FiltersPopper = forwardRef<HTMLDivElement, FiltersPopperProps>(
  (
    {
      houseOptions,
      personOptions,
      savedFilters,
      onSaveAsNew,
      onUpdate,
      onApplyFilters,
    },
    ref
  ) => {
    const [filtersEnabled, setFiltersEnabled] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [showPersons, setShowPersons] = useState(true);
    const [showHouses, setShowHouses] = useState(true);
    const [selectedHouses, setSelectedHouses] = useState<string[]>([]);
    const [married, setMarried] = useState<boolean | null>(null);
    const [gender, setGender] = useState<string | null>(null);
    const [ageRange, setAgeRange] = useState<number[]>([0, 100]);
    const [bornAfter, setBornAfter] = useState<string>("");
    const [bornBefore, setBornBefore] = useState<string>("");
    const [job, setJob] = useState<string>("");
    const [education, setEducation] = useState<string>("");
    const [isAlive, setIsAlive] = useState<boolean | null>(null);
    const [startPerson, setStartPerson] = useState<string | null>(null);
    const [treeDepth, setTreeDepth] = useState<"full" | "immediate">("full");

    return (
      <Paper
        ref={ref}
        elevation={5}
        sx={{
          p: 2,
          width: 350,
          maxHeight: 520,
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        {/* Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Presaved Filters</Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={filtersEnabled}
                onChange={(e) => setFiltersEnabled(e.target.checked)}
              />
            }
            label="Enabled"
            labelPlacement="start"
            sx={{ ml: 1 }}
          />
        </Box>

        <Autocomplete
          options={savedFilters}
          value={selectedFilter}
          onChange={(_, val) => setSelectedFilter(val)}
          renderInput={(params) => (
            <TextField {...params} label="Select filter" size="small" />
          )}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1">Show Node Types</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={showPersons}
              onChange={(e) => setShowPersons(e.target.checked)}
            />
          }
          label="Persons"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showHouses}
              onChange={(e) => setShowHouses(e.target.checked)}
            />
          }
          label="Houses"
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Filter by House</Typography>
        <Autocomplete
          multiple
          options={houseOptions}
          value={selectedHouses}
          onChange={(_, val) => setSelectedHouses(val)}
          renderInput={(params) => (
            <TextField {...params} label="Houses" size="small" />
          )}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle1">Person Filters</Typography>
        <ToggleButtonGroup
          value={married === null ? "" : married}
          exclusive
          onChange={(_, val) => setMarried(val === "" ? null : val)}
          size="small"
          fullWidth
        >
          <ToggleButton value="">Any</ToggleButton>
          <ToggleButton value={false}>Single</ToggleButton>
          <ToggleButton value={true}>Married</ToggleButton>
        </ToggleButtonGroup>

        <Autocomplete
          options={["male", "female"]}
          value={gender}
          onChange={(_, val) => setGender(val)}
          renderInput={(params) => (
            <TextField {...params} label="Gender" size="small" />
          )}
          sx={{ mt: 1, mb: 2 }}
        />

        <Typography variant="body2">Age Range</Typography>
        <Slider
          value={ageRange}
          onChange={(_, val) => setAgeRange(val as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={120}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Born After"
          type="date"
          value={bornAfter}
          onChange={(e) => setBornAfter(e.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 1 }}
        />

        <TextField
          label="Born Before"
          type="date"
          value={bornBefore}
          onChange={(e) => setBornBefore(e.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Job Type"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />

        <TextField
          label="Education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />

        <ToggleButtonGroup
          value={isAlive === null ? "" : isAlive}
          exclusive
          onChange={(_, val) => setIsAlive(val === "" ? null : val)}
          size="small"
          fullWidth
        >
          <ToggleButton value="">Any</ToggleButton>
          <ToggleButton value={true}>Alive</ToggleButton>
          <ToggleButton value={false}>Expired</ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Start From Person</Typography>
        <Autocomplete
          options={personOptions}
          value={startPerson}
          onChange={(_, val) => setStartPerson(val)}
          renderInput={(params) => (
            <TextField {...params} label="Start Person" size="small" />
          )}
          sx={{ mb: 2 }}
        />

        <ToggleButtonGroup
          value={treeDepth}
          exclusive
          onChange={(_, val) => val && setTreeDepth(val)}
          size="small"
          fullWidth
        >
          <ToggleButton value="immediate">Immediate Family</ToggleButton>
          <ToggleButton value="full">Full Tree</ToggleButton>
        </ToggleButtonGroup>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          sx={{ mt: 3 }}
        >
          <Button variant="outlined" color="secondary" onClick={onUpdate}>
            Update
          </Button>
          <Button variant="contained" color="primary" onClick={onSaveAsNew}>
            Save As New
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="contained"
          color="success"
          onClick={onApplyFilters}
          disabled={!filtersEnabled}
          sx={{ color: "#ffffff" }}
        >
          Apply Filters
        </Button>
      </Paper>
    );
  }
);

export default FiltersPopper;
