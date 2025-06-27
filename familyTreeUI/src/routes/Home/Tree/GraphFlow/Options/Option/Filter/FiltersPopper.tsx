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
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import DeleteFilterDialog from "./components/DeleteFilterDialog";
import SaveAsNewView from "./components/SaveAsNewView";
import options from "@/constants/JobAndQualification.json";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterProps,
  initialState as initialFilters,
  selectNodes,
  selectSavedFilters,
  selectTree,
  setSavedFilters,
  setSelectedFilter,
  setCurrentFilter,
  selectSelectedFilter,
} from "@/redux/treeConfigSlice";
import { Nodes } from "@/types/nodeTypes";
import {
  CheckBoxOutlineBlank,
  CheckBox,
  DeleteForeverTwoTone,
} from "@mui/icons-material";
import {
  useCreateFilterMutation,
  useGetFiltersQuery,
} from "@/redux/queries/filter-endpoints";
import { getErrorMessage } from "@/utils/common";

export type FiltersPopperProps = {};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const FiltersPopper = forwardRef<HTMLDivElement, FiltersPopperProps>(
  ({}, ref) => {
    const [filters, setFilters] = useState<FilterProps>(
      initialFilters.currentFilter
    );

    //about saved filters
    const tree = useSelector(selectTree);
    const existingFilters = useSelector(selectSavedFilters);
    const selectedFilter = useSelector(selectSelectedFilter);
    const savedFilters = useMemo(
      () =>
        existingFilters.map((existingFilter) => ({
          id: existingFilter.id,
          label: existingFilter.data.filterName!,
        })),
      [existingFilters]
    );
    const [
      createFilterMutation, // Changed
      {
        data: newFilter, // Changed
        isError: isErrorOnCreate,
        error: errorOnCreate,
        isLoading: isCreating,
      },
    ] = useCreateFilterMutation();
    useEffect(() => {
      if (!(isErrorOnCreate || isCreating) && newFilter) {
        dispatch(
          setSelectedFilter({
            id: newFilter.id,
            label: newFilter.data.filterName!,
          })
        );
        dispatch(setCurrentFilter(newFilter.data));
      }
    }, [isErrorOnCreate, isCreating, newFilter]);
    const {
      data: allSavedFilters, // Changed
      error: fetchFiltersError, // Changed for consistency, though not strictly required by prompt
      isError: isErrorOnFetchFilters,
      isLoading: isfetchFiltersLoading, // Changed for consistency
      isFetching: isfetchFiltersFetching, // Changed for consistency
    } = useGetFiltersQuery(tree?.elementId ?? "", { skip: !tree?.elementId });
    const dispatch = useDispatch();
    useEffect(() => {
      if (
        !(
          isfetchFiltersLoading ||
          isfetchFiltersFetching ||
          isErrorOnFetchFilters
        ) &&
        allSavedFilters
      )
        dispatch(setSavedFilters(allSavedFilters));
    }, [
      allSavedFilters,
      fetchFiltersError,
      isfetchFiltersLoading,
      isfetchFiltersFetching,
    ]);
    const handleFilterChange = (val: { id: string; label: string } | null) => {
      dispatch(setSelectedFilter(val));
      if (val) {
        const currFilter = existingFilters.find(
          (existingFilter) => existingFilter.id === val.id
        );
        currFilter && dispatch(setCurrentFilter(currFilter.data));
      }
    };
    const handleChange = (keys: string[], value: any) => {
      setFilters((prev) => {
        const newState = { ...prev };
        let curr: any = newState;

        for (let i = 0; i < keys.length - 1; i++) {
          curr[keys[i]] = { ...curr[keys[i]] };
          curr = curr[keys[i]];
        }

        curr[keys[keys.length - 1]] = value;
        return newState;
      });
    };

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

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [filtersToDelete, setFiltersToDelete] = useState<string[]>([]); // IDs of filters to delete

    const handleToggleFilter = (id: string) => {
      setFiltersToDelete((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
    };

    const handleDeleteFilters = () => {
      // handle delete logic here using filtersToDelete
      console.log("Deleting filters: ", filtersToDelete);
      setDeleteDialogOpen(false);
      setFiltersToDelete([]);
    };

    const [filterName, setFilterName] = useState("");
    const [checking, setChecking] = useState(false);
    const [nameExists, setNameExists] = useState<boolean | null>(null);
    const [saveAsOpen, setSaveAsOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSaveNameChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const name = e.target.value;
      setFilterName(name);
      setNameExists(null);

      if (name.trim().length === 0) return;

      setChecking(true);
      const exists = Boolean(
        existingFilters.find(
          (existingFilter) => existingFilter.data.filterName === name
        )
      );
      setChecking(false);
      setNameExists(exists);
    };
    const handleSave = async () => {
      // Call your actual save logic here
      handleChange(["filterName"], filterName);
      createFilterMutation({
        treeId: tree?.elementId ?? "",
        filter: { ...filters, filterName: filterName },
      });

      alert(`Filter "${filterName}" saved successfully`);
      setFilterName("");
      setNameExists(null);
    };
    const handleSaveAs = () => {
      setSaveAsOpen((prev) => !prev);
      setChecking(false);
      setFilterName("");
      setNameExists(null);
    };

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ my: 2 }}
        >
          <Typography variant="subtitle1">Presaved Filters</Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={filters.enabled}
                onChange={(e) => handleChange(["enabled"], e.target.checked)}
              />
            }
            label="Enabled"
            labelPlacement="start"
            sx={{ ml: 1 }}
          />
        </Box>
        {isErrorOnFetchFilters && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(fetchFiltersError)}
          </Alert>
        )}
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <Autocomplete
            loading={isfetchFiltersLoading || isfetchFiltersFetching}
            disabled={isErrorOnFetchFilters}
            options={savedFilters}
            value={selectedFilter}
            disablePortal
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            onChange={(_, val) => handleFilterChange(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select filter"
                size="small"
                fullWidth
              />
            )}
            sx={{ flex: 1 }}
          />
          {savedFilters.length > 0 && (
            <IconButton
              color="error"
              sx={{ ml: 1 }}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteForeverTwoTone />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" sx={{ my: 2 }}>
          Show Node Types
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.filterBy.nodeTypes.Person}
              onChange={(e) =>
                handleChange(
                  ["filterBy", "nodeTypes", Nodes.Person],
                  e.target.checked
                )
              }
            />
          }
          label="Persons"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.filterBy.nodeTypes.House}
              onChange={(e) =>
                handleChange(
                  ["filterBy", "nodeTypes", Nodes.House],
                  e.target.checked
                )
              }
            />
          }
          label="Houses"
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ my: 2 }}>
          Filter by House
        </Typography>
        <Autocomplete
          multiple
          limitTags={1}
          options={houses}
          autoHighlight
          autoComplete
          value={filters.filterBy.nodeProps.House.selectedHouses}
          disableCloseOnSelect
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
          onChange={(_, vals) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.House, "selectedHouses"],
              vals
            )
          }
          renderInput={(params) => (
            <TextField {...params} label="Houses" size="small" />
          )}
          sx={{ mb: 2 }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ my: 2 }}>
          Person Filters
        </Typography>

        <Stack spacing={1.2}>
          {" "}
          {/* Adjust spacing as needed */}
          <ToggleButtonGroup
            value={filters.filterBy.nodeProps.Person.gender ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", Nodes.Person, "gender"],
                val === "" ? null : val
              )
            }
            size="small"
            fullWidth
          >
            <ToggleButton value="">Any</ToggleButton>
            <ToggleButton value="male">Male</ToggleButton>
            <ToggleButton value="female">Female</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={filters.filterBy.nodeProps.Person.isAlive ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", Nodes.Person, "isAlive"],
                val === "" ? null : val
              )
            }
            size="small"
            fullWidth
          >
            <ToggleButton value="">Any</ToggleButton>
            <ToggleButton value={true}>Alive</ToggleButton>
            <ToggleButton value={false}>Expired</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={filters.filterBy.nodeProps.Person.married ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", Nodes.Person, "married"],
                val === "" ? null : val
              )
            }
            size="small"
            fullWidth
          >
            <ToggleButton value="">Any</ToggleButton>
            <ToggleButton value={false}>Single</ToggleButton>
            <ToggleButton value={true}>Married</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Typography variant="body2" sx={{ my: 1 }}>
          Age Range
        </Typography>
        <Slider
          value={filters.filterBy.nodeProps.Person.age}
          onChange={(_, val) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "age"],
              typeof val === "number" ? [val, val] : val
            )
          }
          valueLabelDisplay="auto"
          min={0}
          max={100}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Born After"
          type="date"
          value={filters.filterBy.nodeProps.Person.bornAfter}
          onChange={(e) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "bornAfter"],
              e.target.value
            )
          }
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Born Before"
          type="date"
          value={filters.filterBy.nodeProps.Person.bornBefore}
          onChange={(e) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "bornBefore"],
              e.target.value
            )
          }
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
          value={filters.filterBy.nodeProps.Person.jobTypes}
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
          onChange={(_, vals) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "jobTypes"],
              vals
            )
          }
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
          value={filters.filterBy.nodeProps.Person.studies}
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
          onChange={(_, vals) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "studies"],
              vals
            )
          }
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
          value={filters.filterBy.nodeProps.Person.qualifications}
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
          onChange={(_, vals) =>
            handleChange(
              ["filterBy", "nodeProps", Nodes.Person, "qualifications"],
              vals
            )
          }
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
        <Typography variant="subtitle1" sx={{ my: 2 }}>
          Start From Person
        </Typography>
        <Autocomplete
          autoHighlight
          autoComplete
          options={persons}
          value={filters.filterBy.rootPerson.person}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterSelectedOptions
          disablePortal
          onChange={(_, val) =>
            handleChange(["filterBy", "rootPerson", "person"], val)
          }
          renderInput={(params) => (
            <TextField {...params} label="Start Person" size="small" />
          )}
          sx={{ mb: 2 }}
        />
        <ToggleButtonGroup
          value={
            filters.filterBy.rootPerson.onlyImmediate ? "immediate" : "full"
          }
          exclusive
          onChange={(_, val) =>
            handleChange(
              ["filterBy", "rootPerson", "onlyImmediate"],
              val === "immediate" ? true : false
            )
          }
          size="small"
          fullWidth
        >
          <ToggleButton value="immediate">Immediate Family</ToggleButton>
          <ToggleButton value="full">Full Tree</ToggleButton>
        </ToggleButtonGroup>
        <Divider sx={{ my: 2 }} />
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => console.log("clicked Reset")}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={() => console.log("clicked Apply Filters")}
            disabled={!filters.enabled}
            sx={{ color: "#ffffff" }}
          >
            Apply Filters
          </Button>
        </Stack>

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
            disabled={!selectedFilter}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color={saveAsOpen ? "error" : "primary"}
            onClick={handleSaveAs}
            disabled={isCreating}
          >
            {saveAsOpen ? "Close" : "Save As New"}
          </Button>
        </Stack>
        {saveAsOpen && (
          <SaveAsNewView
            filterName={filterName}
            onFilterNameChange={handleSaveNameChange}
            onSave={handleSave}
            saving={isCreating}
            nameExists={nameExists}
            checking={checking}
            inputRef={inputRef}
          />
        )}
        {checking && <CircularProgress size={20} sx={{ mt: 1 }} />}
        {nameExists && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Name already exists
          </Alert>
        )}
        {isErrorOnCreate && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(errorOnCreate)}
          </Alert>
        )}
        <DeleteFilterDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          savedFilters={savedFilters}
          filtersToDelete={filtersToDelete}
          onToggleFilter={handleToggleFilter}
          onDeleteFilters={handleDeleteFilters}
        />
      </Paper>
    );
  }
);

export default FiltersPopper;
