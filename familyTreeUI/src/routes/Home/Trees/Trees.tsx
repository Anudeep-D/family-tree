import { useAuth } from "@/hooks/useAuth";
import { useGetTreesQuery } from "@/redux/queries/tree-endpoints";
import { Tree } from "@/types/entityTypes"; // Changed
import ConfirmDialog, { ConfirmProps } from "@/routes/common/ConfirmDialog";
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  TableSortLabel,
  TableBody,
  Skeleton,
  TablePagination,
  Link,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import React, { useMemo, useState } from "react";
import { Role } from "@/types/common";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Tree; // Changed
  label: string;
}

const headCells: readonly HeadCell[] = [
  { id: "name", label: "Name" },
  { id: "desc", label: "Description" },
  { id: "access", label: "Role" },
  { id: "createdBy", label: "Created by" },
  { id: "createdAt", label: "Created at" },
];

export function getComparator<Key extends keyof Tree>( // Changed
  order: "asc" | "desc",
  orderBy: Key
): (a: Tree, b: Tree) => number { // Changed
  return (a: Tree, b: Tree) => { // Changed
    const aVal = a[orderBy];
    const bVal = b[orderBy];

    // Handle undefined safely
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  };
}

export type TreesProps = { // Changed
  handleTreeSelection: (tree: Tree) => void; // Changed
};

const Trees: React.FC<TreesProps> = ({ handleTreeSelection }) => { // Changed
  const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]); // Changed
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const { user } = useAuth(); // Get user from useAuth
  const {
    data: allTrees, // Changed
    error: treesError, // Changed for consistency, though not strictly required by prompt
    isLoading: isTreesLoading, // Changed for consistency
    isFetching: isTreesFetching, // Changed for consistency
  } = useGetTreesQuery(); // Changed

  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Tree>("name"); // Changed
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState<ConfirmProps>({ open: false });

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Tree // Changed
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSearchTermInTree = (tree: Tree) => { // Changed
    if (!search) return true;
    return (
      tree.name.toLowerCase().includes(search.toLowerCase()) ||
      tree.desc?.toLowerCase().includes(search.toLowerCase()) ||
      tree.access?.toLowerCase().includes(search.toLowerCase()) ||
      tree.createdBy?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredTrees = useMemo(() => { // Changed
    if (!allTrees) return []; // Changed
    return allTrees // Changed
      .filter(
        (tree) => // Changed
          isSearchTermInTree(tree) && // Changed
          (!filterRole || tree.access === filterRole) // Changed
      )
      .sort(getComparator(order, orderBy));
  }, [allTrees, search, filterRole, order, orderBy]); // Changed

  const toggleSelect = (id: string) => {
    setSelectedTreeIds((prev) => // Changed
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTreeIds.length === filteredTrees.length) { // Changed
      setSelectedTreeIds([]); // Changed
    } else {
      setSelectedTreeIds( // Changed
        filteredTrees // Changed
          .filter((t) => Boolean(t.elementId)) // Changed
          .map((t) => t.elementId!) // Changed
      );
    }
  };

  const handleDelete = () => {
    if (!allTrees) return;

    const selectedTrees = allTrees.filter((tree) => selectedTreeIds.includes(tree.elementId!));
    const deletableTrees = selectedTrees.filter((tree) => tree.access === Role.Admin);
    const skippedTrees = selectedTrees.filter((tree) => tree.access !== Role.Admin);

    let message = "";
    if (deletableTrees.length > 0) {
      message += `Are you sure you want to delete the following trees: ${deletableTrees.map((t) => t.name).join(", ")}?`;
    }
    if (skippedTrees.length > 0) {
      message += `\nThe following trees will be skipped due to insufficient permissions: ${skippedTrees.map((t) => t.name).join(", ")}.`;
    }

    if (deletableTrees.length === 0 && skippedTrees.length > 0) {
      setDialogOpen({
        open: true,
        title: "Deletion Skipped",
        message: `The following trees will be skipped due to insufficient permissions: ${skippedTrees.map((t) => t.name).join(", ")}. No trees will be deleted.`,
        action: "OK",
      });
    } else if (deletableTrees.length > 0) {
      setDialogOpen({
        open: true,
        title: "Confirm Deletion",
        message,
        action: "Delete",
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!allTrees) return;
    const deletableTrees = allTrees.filter(
      (tree) => selectedTreeIds.includes(tree.elementId!) && tree.access === Role.Admin
    );
    console.log("Deleting trees:", deletableTrees);
    // Actual delete API call will be handled later
    setDialogOpen({ open: false });
  };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Use user from useAuth */}
      <Typography variant="h5" gutterBottom>
        Welcome, {user?.name || "Guest"}
      </Typography>

      {/* Rest of the component remains the same */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          label="Search trees" // Changed
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={filterRole}
            label="Filter by Role"
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Editor">Editor</MenuItem>
            <MenuItem value="Viewer">Viewer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {selectedTreeIds.length > 0 && ( // Changed
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outlined" onClick={() => setSelectedTreeIds([])}> 
            Cancel
          </Button>
        </Box>
      )}
      {treesError && ( // Changed for consistency
        <Alert severity="error">Failed to fetch trees</Alert> // Changed
      )}
      <TableContainer component={Paper} elevation={3} sx={{ mt: 2, mb: 2 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={ // Changed
                    selectedTreeIds.length === // Changed
                      filteredTrees.slice( // Changed
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      ).length && filteredTrees.length > 0 // Changed
                  }
                  onChange={handleSelectAll}
                  inputProps={{ "aria-label": "select all trees" }} // Changed
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isTreesFetching || isTreesLoading ? ( // Changed for consistency
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Skeleton variant="text" width="100%" height={20} />
                </TableCell>
              </TableRow>
            ) : filteredTrees.length > 0 ? ( // Changed
              filteredTrees // Changed
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tree) => ( // Changed
                  <TableRow key={tree.elementId} hover> 
                    <TableCell key={`${tree.elementId}-checkbox`} padding="checkbox">
                      <Checkbox
                        checked={selectedTreeIds.includes( // Changed
                          tree.elementId!
                        )}
                        onChange={() => toggleSelect(tree.elementId!)}
                      />
                    </TableCell>
                    <TableCell key={`${tree.elementId}-name`}>
                      <Link
                        component="button"
                        onClick={() => handleTreeSelection(tree!)} // Changed
                      >
                        {tree.name} 
                      </Link>
                    </TableCell>
                    <TableCell key={`${tree.elementId}-desc`}>{tree.desc ?? "-"}</TableCell> 
                    <TableCell key={`${tree.elementId}-role`}>{tree.access}</TableCell> 
                    <TableCell key={`${tree.elementId}-createdBy`}>{tree.createdBy}</TableCell> 
                    <TableCell key={`${tree.elementId}-createdAt`}>{tree.createdAt ?? "-"}</TableCell> 
                  </TableRow>
                ))
            ) : (
              filteredTrees.length === 0 && ( // Changed
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No trees found. 
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 50, 100]}
          component="div"
          count={filteredTrees.length} // Changed
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <ConfirmDialog
        {...dialogOpen}
        onClose={() => setDialogOpen({ open: false })}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
};

export default Trees; // Changed
