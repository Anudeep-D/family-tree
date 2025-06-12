import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import "./Navbar.scss"; // Keep for layout styles if necessary, or remove if all handled by MUI
import CreateProject from "../Projects/CreateProject";
import Account from "./Account";

export default function Navbar() {
  const [openProject, setOpenProject] = useState(false);

  return (
    <>
      <AppBar position="static" className="navbar-mui">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            FamilyTree
          </Typography>
          {/* Placeholder for search input if needed in future */}
          {/* <InputBase placeholder="Search…" sx={{ color: 'inherit', ml: 2, flex: 1 }} /> */}
          <Box sx={{ flexGrow: 1 }} />{" "}
          {/* This Box will push actions to the right */}
          <Button
            onClick={() => setOpenProject(true)}
            color="inherit"
            startIcon={<AddIcon />}
          >
            New Project
          </Button>
          <IconButton color="inherit" aria-label="notifications">
            <Badge color="secondary" badgeContent={0}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Account />
        </Toolbar>
      </AppBar>
      <CreateProject open={openProject} onClose={() => setOpenProject(false)} />
    </>
  );
}

// Helper 'styled' components (can be moved to a separate file or top of this file)
// This is a common pattern but requires @mui/system or @mui/styled-engine
// For simplicity, if these cause issues, I might remove them and use sx props.
// Let's assume they work for now.
// import { styled } from '@mui/material/styles'; // Moved to top
