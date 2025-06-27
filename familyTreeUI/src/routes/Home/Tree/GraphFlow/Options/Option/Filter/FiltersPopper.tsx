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
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import DeleteFilterDialog from "./components/DeleteFilterDialog";
import SaveAsNewView from "./components/SaveAsNewView";
import options from "@/constants/JobAndQualification.json";
import { useDispatch, useSelector } from "react-redux";
import {
  selectNodes,
  selectSavedFilters,
  selectTree,
  setSavedFilters,
  setSelectedFilter,
  setCurrentFilter,
  selectSelectedFilter,
  selectCurrentFilter,
  initialState,
} from "@/redux/treeConfigSlice";
import { Nodes } from "@/types/nodeTypes";
import {
  CheckBoxOutlineBlank,
  CheckBox,
  DeleteForeverTwoTone,
  FilterAltTwoTone,
  SaveAsTwoTone,
  UpdateTwoTone,
  ClearAllTwoTone,
  DangerousTwoTone,
  RotateLeftTwoTone,
} from "@mui/icons-material";
import {
  useCreateFilterMutation,
  useUpdateFilterMutation,
  useGetFiltersQuery,
} from "@/redux/queries/filter-endpoints";
import { getErrorMessage } from "@/utils/common";

export type FiltersPopperProps = {};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const FiltersPopper = forwardRef<HTMLDivElement, FiltersPopperProps>(
  ({}, ref) => {
    //about saved filters
    const tree = useSelector(selectTree);
    const currentFilter = useSelector(selectCurrentFilter);
    const existingFilters = useSelector(selectSavedFilters);
    const selectedFilter = useSelector(selectSelectedFilter);
    const savedFilters = useMemo(
      () =>
        existingFilters.map((existingFilter) => ({
          id: existingFilter.elementId,
          label: existingFilter.filterName!,
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
            id: newFilter.elementId,
            label: newFilter.filterName!,
          })
        );
        const { elementId, ...newActualFilter } = newFilter;
        dispatch(setCurrentFilter(newActualFilter));
        handleSaveAs();
      }
    }, [isErrorOnCreate, isCreating, newFilter]);
    const [
      updateFilterMutation, // Changed
      { isError: isErrorOnUpdate, error: errorOnUpdate, isLoading: isUpdating },
    ] = useUpdateFilterMutation();
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
          (existingFilter) => existingFilter.elementId === val.id
        );
        if (currFilter) {
          const { elementId, ...newActualFilter } = currFilter;
          dispatch(setCurrentFilter(newActualFilter));
        }
      } else {
        dispatch(setCurrentFilter(initialState.currentFilter));
      }
    };

    const handleReset = () => {
      if (selectedFilter) {
        const currFilter = existingFilters.find(
          (existingFilter) => existingFilter.elementId === selectedFilter.id
        );
        if (currFilter) {
          const { elementId, ...newActualFilter } = currFilter;
          dispatch(setCurrentFilter(newActualFilter));
        }
      } else {
        dispatch(setCurrentFilter(initialState.currentFilter));
      }
    };
    const handleChange = (keys: string[], value: any) => {
      const newState = { ...currentFilter };
      let curr: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        curr[keys[i]] = { ...curr[keys[i]] };
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = value;
      dispatch(setCurrentFilter(newState));
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

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);// IDs of filters to delete




    const handleUpdate = () => {
      updateFilterMutation({
        filterId: selectedFilter?.id ?? "",
        filter: { ...currentFilter },
      });
    };

    const [filterName, setFilterName] = useState("");
    const [checking, setChecking] = useState(false);
    const [nameExists, setNameExists] = useState<boolean | null>(null);
    const [saveAsOpen, setSaveAsOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSaveNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setFilterName(name);
      setNameExists(null);

      if (name.trim().length === 0) return;

      setChecking(true);
      const exists = Boolean(
        existingFilters.find(
          (existingFilter) => existingFilter.filterName === name
        )
      );
      setChecking(false);
      setNameExists(exists);
    };
    const handleSave = () => {
      // Call your actual save logic here
      handleChange(["filterName"], filterName);
      createFilterMutation({
        treeId: tree?.elementId ?? "",
        filter: { ...currentFilter, filterName: filterName },
      });

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
          maxHeight: 650,
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
                checked={currentFilter.enabled}
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
              checked={currentFilter.filterBy.nodeTypes.Person}
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
              checked={currentFilter.filterBy.nodeTypes.House}
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
          value={currentFilter.filterBy.nodeProps.house.selectedHouses}
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
              ["filterBy", "nodeProps", "house", "selectedHouses"],
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
            value={currentFilter.filterBy.nodeProps.person.gender ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", "person", "gender"],
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
            value={currentFilter.filterBy.nodeProps.person.isAlive ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", "person", "isAlive"],
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
            value={currentFilter.filterBy.nodeProps.person.married ?? ""}
            exclusive
            onChange={(_, val) =>
              handleChange(
                ["filterBy", "nodeProps", "person", "married"],
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
          value={currentFilter.filterBy.nodeProps.person.age}
          onChange={(_, val) =>
            handleChange(
              ["filterBy", "nodeProps", "person", "age"],
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
          value={currentFilter.filterBy.nodeProps.person.bornAfter}
          onChange={(e) =>
            handleChange(
              ["filterBy", "nodeProps", "person", "bornAfter"],
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
          value={currentFilter.filterBy.nodeProps.person.bornBefore}
          onChange={(e) =>
            handleChange(
              ["filterBy", "nodeProps", "person", "bornBefore"],
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
          value={currentFilter.filterBy.nodeProps.person.jobTypes}
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
            handleChange(["filterBy", "nodeProps", "person", "jobTypes"], vals)
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
          value={currentFilter.filterBy.nodeProps.person.studies}
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
            handleChange(["filterBy", "nodeProps", "person", "studies"], vals)
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
          value={currentFilter.filterBy.nodeProps.person.qualifications}
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
              ["filterBy", "nodeProps", "person", "qualifications"],
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
          value={currentFilter.filterBy.rootPerson.person}
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
            currentFilter.filterBy.rootPerson.onlyImmediate
              ? "immediate"
              : "full"
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
        {saveAsOpen && (
          <SaveAsNewView
            filterName={filterName}
            onFilterNameChange={handleSaveNameChange}
            onSave={handleSave}
            saving={isCreating}
            nameExists={nameExists}
            checking={checking}
            inputRef={inputRef}
            error={isErrorOnCreate ? getErrorMessage(errorOnCreate) : undefined}
          />
        )}
        {isErrorOnUpdate && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {getErrorMessage(errorOnUpdate)}
          </Alert>
        )}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ mt: 3 }}
        >
          <ButtonGroup fullWidth variant="text" sx={{ flex: 1, gap: 1 }}>
            <Tooltip title="Clear Filter">
              <Button
                variant="outlined"
                onClick={() =>
                  dispatch(setCurrentFilter(initialState.currentFilter))
                }
                sx={{ color: "#b6a3c5", background: "#00000000" }}
              >
                <ClearAllTwoTone />
              </Button>
            </Tooltip>

            <Tooltip title="Reset to Saved Filter">
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ color: "#e2d83f", background: "#00000000" }}
              >
                <RotateLeftTwoTone />
              </Button>
            </Tooltip>

            <Tooltip title="Apply Filter">
              <Button
                variant="outlined"
                onClick={() => console.log("clicked Apply Filters")}
                disabled={!currentFilter.enabled}
                sx={{ color: "#5688fc", background: "#00000000" }}
              >
                <FilterAltTwoTone />
              </Button>
            </Tooltip>
            <Tooltip title="Update Existing Filter">
              <Button
                variant="outlined"
                onClick={() => handleUpdate()}
                disabled={!selectedFilter}
                sx={{ color: "#00acc1", background: "#00000000" }}
                loading={isUpdating}
              >
                <UpdateTwoTone />
              </Button>
            </Tooltip>

            <Tooltip
              title={saveAsOpen ? "Close Save Panel" : "Save As New Filter"}
            >
              <Button
                variant="outlined"
                onClick={handleSaveAs}
                disabled={isCreating}
                sx={{
                  color: saveAsOpen ? "#ff5c5c" : "#00d285",
                  background: "#00000000",
                }}
              >
                {saveAsOpen ? <DangerousTwoTone /> : <SaveAsTwoTone />}
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Stack>

        <DeleteFilterDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        />
      </Paper>
    );
  }
);

export default FiltersPopper;
