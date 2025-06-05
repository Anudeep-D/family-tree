import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  TableSortLabel,
  TablePagination,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useAuth } from '../../hooks/useAuth'; // Added
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Navbar from "./NavBar/Navbar";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Project;
  label: string;
}

interface Project {
  id: string;
  name: string;
  access: string;
}

const headCells: readonly HeadCell[] = [
  { id: "name", label: "Name" },
  { id: "access", label: "Access" },
];

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: string }, b: { [key in Key]: string }) => number {
  return order === "desc"
    ? (a, b) => b[orderBy].localeCompare(a[orderBy])
    : (a, b) => a[orderBy].localeCompare(b[orderBy]);
}

export default function Home() {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const { user } = useAuth(); // Get user from useAuth

  const allProjects = useMemo(
    () =>
      user // User from useAuth now
        ? [
            { id: "1", name: "Admin Project Alpha", access: "Admin" },
            { id: "2", name: "Admin Project Beta", access: "Admin" },
            { id: "3", name: "Editor Project Alpha", access: "Editor" },
            { id: "4", name: "Editor Project Beta", access: "Editor" },
            { id: "5", name: "Viewer Project Alpha", access: "Viewer" },
            { id: "6", name: "Viewer Project Beta", access: "Viewer" },
          ]
        : [],
    [user] // Dependency is now user from useAuth
  );

  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Project>("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Project
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

  const filteredProjects = useMemo(() => {
    return allProjects
      .filter(
        (project) =>
          (!search ||
            project.name.toLowerCase().includes(search.toLowerCase())) &&
          (!filterRole || project.access === filterRole)
      )
      .sort(getComparator(order, orderBy));
  }, [allProjects, search, filterRole, order, orderBy]);

  const toggleSelect = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleDelete = () => {
    console.log("Delete projects:", selectedProjectIds);
  };

  return (
    <Box>
      <Navbar />
      <Breadcrumb />
      <Container sx={{ mt: 4 }}>
        {/* Use user from useAuth */}
        <Typography variant="h5" gutterBottom>
          Welcome, {user?.name || 'Guest'} 
        </Typography>

        {/* Rest of the component remains the same */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            label="Search projects"
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

        {selectedProjectIds.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedProjectIds([])}
            >
              Cancel
            </Button>
          </Box>
        )}

        <TableContainer component={Paper} elevation={3} sx={{ mt: 2, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedProjectIds.length ===
                        filteredProjects.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        ).length && filteredProjects.length > 0
                    }
                    onChange={handleSelectAll}
                    inputProps={{ "aria-label": "select all projects" }}
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
              {filteredProjects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProjectIds.includes(project.id)}
                        onChange={() => toggleSelect(project.id)}
                      />
                    </TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.access}</TableCell>
                  </TableRow>
                ))}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Container>
    </Box>
  );
}
