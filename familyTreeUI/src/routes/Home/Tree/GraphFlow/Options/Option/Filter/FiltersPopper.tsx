import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
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
import options from "@/constants/JobAndQualification.json";
import { useSelector } from "react-redux";
import { selectNodes } from "@/redux/treeConfigSlice";
import { Nodes } from "@/types/nodeTypes";
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";

export type FiltersPopperProps = {};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const FiltersPopper = forwardRef<HTMLDivElement, FiltersPopperProps>(
  ({}, ref) => {
    const [filtersEnabled, setFiltersEnabled] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<{
      id: string;
      label: string;
    } | null>(null);
    const [showPersons, setShowPersons] = useState(true);
    const [showHouses, setShowHouses] = useState(true);
    const [selectedHouses, setSelectedHouses] = useState<
      { id: string; label: string }[]
    >([]);
    const [married, setMarried] = useState<boolean | null>(null);
    const [gender, setGender] = useState<string | null>(null);
    const [ageRange, setAgeRange] = useState<number[]>([0, 100]);
    const [bornAfter, setBornAfter] = useState<string>("");
    const [bornBefore, setBornBefore] = useState<string>("");
    const [jobs, setJobs] = useState<
      { id: string; label: string; group: string }[]
    >([]);
    const [studies, setStudies] = useState<
      { id: string; label: string; group: string }[]
    >([]);
    const [qualifications, setQualifications] = useState<
      {
        id: string;
        label: string;
        group: string;
      }[]
    >([]);
    const [isAlive, setIsAlive] = useState<boolean | null>(null);
    const [startPerson, setStartPerson] = useState<{
      id: string;
      label: string;
    } | null>(null);
    const [treeDepth, setTreeDepth] = useState<"full" | "immediate">("full");

    const allNodes = useSelector(selectNodes);

    const persons: { id: string; label: string }[] = [];
    const houses: { id: string; label: string }[] = [];

    allNodes.forEach((eachNode) => {
      if (eachNode.type === Nodes.House) {
        houses.push({ id: eachNode.id, label: eachNode.data["name"] });
      }

      if (eachNode.type === Nodes.Person) {
        persons.push({ id: eachNode.id, label: eachNode.data["name"] });
      }
    });

    const savedFilters: { id: string; label: string }[] = [];
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
          disablePortal
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterSelectedOptions
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
          limitTags={1}
          options={houses}
          autoHighlight
          autoComplete
          value={selectedHouses}
          disableCloseOnSelect
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            console.log("Houses: ", props, option, selected, selectedHouses);
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            );
          }}
          disablePortal
          onChange={(_, vals) => setSelectedHouses(vals)}
          renderInput={(params) => (
            <TextField {...params} label="Houses" size="small" />
          )}
          sx={{ mb: 2 }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Person Filters</Typography>

        <Stack spacing={1.2}>
          {" "}
          {/* Adjust spacing as needed */}
          <ToggleButtonGroup
            value={gender === null ? "" : gender}
            exclusive
            onChange={(_, val) => setGender(val === "" ? null : val)}
            size="small"
            fullWidth
          >
            <ToggleButton value="">Any</ToggleButton>
            <ToggleButton value="male">Male</ToggleButton>
            <ToggleButton value="female">Female</ToggleButton>
          </ToggleButtonGroup>
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
        </Stack>
        <Typography variant="body2">Age Range</Typography>
        <Slider
          value={ageRange}
          onChange={(_, val) => setAgeRange(val as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={100}
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
        <Autocomplete
          multiple
          limitTags={1}
          options={options.JobTypeOptions.sort((a, b) =>
            a.group.localeCompare(b.group)
          )}
          autoHighlight
          autoComplete
          value={jobs}
          disableCloseOnSelect
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option, { selected }) => {
            console.log("Jobs: ", props, option, selected, jobs);
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            );
          }}
          disablePortal
          onChange={(_, vals) => setJobs(vals)}
          renderInput={(params) => (
            <TextField {...params} label="Job Type" size="small" />
          )}
          sx={{ mb: 2 }}
        />
        <Autocomplete
          multiple
          limitTags={1}
          options={options.fieldOfStudyOptions.sort((a, b) =>
            a.group.localeCompare(b.group)
          )}
          autoHighlight
          autoComplete
          value={studies}
          disableCloseOnSelect
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            );
          }}
          disablePortal
          onChange={(_, vals) => setStudies(vals)}
          renderInput={(params) => (
            <TextField {...params} label="Select field of study" size="small" />
          )}
          sx={{ mb: 2 }}
        />
        <Autocomplete
          multiple
          limitTags={1}
          options={options.QualificationOptions.sort((a, b) =>
            a.group.localeCompare(b.group)
          )}
          autoHighlight
          autoComplete
          value={qualifications}
          disableCloseOnSelect
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.label}
              </li>
            );
          }}
          disablePortal
          onChange={(_, vals) => setQualifications(vals)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select highest qualification"
              size="small"
            />
          )}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Start From Person</Typography>
        <Autocomplete
          autoHighlight
          autoComplete
          options={persons}
          value={startPerson}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterSelectedOptions
          disablePortal
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
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => console.log("clicked Update")}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => console.log("clicked Save As New")}
          >
            Save As New
          </Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Button
          fullWidth
          variant="contained"
          color="success"
          onClick={() => console.log("clicked Apply Filters")}
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
