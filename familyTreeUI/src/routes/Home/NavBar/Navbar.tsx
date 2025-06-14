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
import CreateTree from "../Trees/CreateTree"; // Changed
import Account from "./Account";

export default function Navbar() {
  const [openTree, setOpenTree] = useState(false); // Changed

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
            onClick={() => setOpenTree(true)} // Changed
            color="inherit"
            startIcon={<AddIcon />}
          >
            New Tree 
          </Button>
          <IconButton color="inherit" aria-label="notifications">
            <Badge color="secondary" badgeContent={0}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Account />
        </Toolbar>
      </AppBar>
      <CreateTree open={openTree} onClose={() => setOpenTree(false)} /> 
    </>
  );
}

// Helper 'styled' components (can be moved to a separate file or top of this file)
// This is a common pattern but requires @mui/system or @mui/styled-engine
// For simplicity, if these cause issues, I might remove them and use sx props.
// Let's assume they work for now.
// import { styled } from '@mui/material/styles'; // Moved to top
