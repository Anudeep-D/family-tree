import React, { useState } from "react";
import { useLogoutMutation } from "@/redux/queries/auth-endpoints";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Box,
} from "@mui/material";
import {
  Add as AddIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
} from "@mui/icons-material";
import "./Navbar.scss"; // Keep for layout styles if necessary, or remove if all handled by MUI
import CreateProject from "../Projects/CreateProject";

export default function Navbar() {
  const [logout] = useLogoutMutation();
  const [openProject, setOpenProject]= useState(false);
  const handleLogout = async () => {
    await logout();
    window.location.href = "/login"; // Consider using useNavigate for internal routing
  };

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
          <IconButton color="inherit" aria-label="notifications">
            <NotificationsIcon />
          </IconButton>
          <Button
            onClick={() => setOpenProject(true)}
            color="inherit"
            startIcon={<AddIcon />}
          >
            New Project
          </Button>
          <Button color="inherit" startIcon={<AccountCircle />}>
            My Profile
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <CreateProject
       open={openProject}
       onClose={()=>setOpenProject(false)}
       />
    </>
  );
}

// Helper 'styled' components (can be moved to a separate file or top of this file)
// This is a common pattern but requires @mui/system or @mui/styled-engine
// For simplicity, if these cause issues, I might remove them and use sx props.
// Let's assume they work for now.
// import { styled } from '@mui/material/styles'; // Moved to top
