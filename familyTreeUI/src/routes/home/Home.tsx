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
  Skeleton,
  Alert,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useAuth } from "../../hooks/useAuth"; // Added
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Navbar from "./NavBar/Navbar";
import { useGetProjectsQuery } from "@/redux/queries/project-endpoints";
import { Project } from "@/types/entityTypes";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Project;
  label: string;
}

const headCells: readonly HeadCell[] = [
  { id: "name", label: "Name" },
  { id: "access", label: "Access" },
];

export function getComparator<Key extends keyof Project>(
  order: "asc" | "desc",
  orderBy: Key
): (a: Project, b: Project) => number {
  return (a: Project, b: Project) => {
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

export default function Home() {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const { user } = useAuth(); // Get user from useAuth
  const {
    data: allProjects,
    error: projectsError,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useGetProjectsQuery();

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
    if (!allProjects) return [];
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
      setSelectedProjectIds(
        filteredProjects
          .filter((p) => Boolean(p.elementId))
          .map((p) => p.elementId!)
      );
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
          Welcome, {user?.name || "Guest"}
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
        {projectsError && (
          <Alert severity="error">Failed to fetch projects</Alert>
        )}
        <TableContainer component={Paper} elevation={3} sx={{ mt: 2, mb: 2 }}>
          <Table size="medium">
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
              {isProjectsFetching || isProjectsLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Skeleton variant="text" width="100%" height={20} />
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length > 0 ? (
                filteredProjects
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProjectIds.includes(project.elementId!)}
                          onChange={() => toggleSelect(project.elementId!)}
                        />
                      </TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.access}</TableCell>
                    </TableRow>
                  ))
              ) : (
                filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )
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
