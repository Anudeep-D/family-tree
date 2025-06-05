import React from "react";
import { useLogoutMutation } from "@/redux/queries/auth-endpoints";
import { AppBar, Toolbar, Typography, Button, IconButton, InputBase, Box } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Notifications as NotificationsIcon, AccountCircle } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles'; // For search input background & styled
import "./Navbar.scss"; // Keep for layout styles if necessary, or remove if all handled by MUI

export default function Navbar() {
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login"; // Consider using useNavigate for internal routing
  };

  // Basic search styling, can be expanded - COMMENTED OUT FOR SIMPLICITY
  // const Search = styled('div')(({ theme }) => ({
  //   position: 'relative',
  //   borderRadius: theme.shape.borderRadius,
  //   backgroundColor: alpha(theme.palette.common.white, 0.15), 
  //   '&:hover': {
  //     backgroundColor: alpha(theme.palette.common.white, 0.25),
  //   },
  //   marginRight: theme.spacing(2),
  //   marginLeft: 0,
  //   width: '100%',
  //   [theme.breakpoints.up('sm')]: {
  //     marginLeft: theme.spacing(3),
  //     width: 'auto',
  //   },
  // }));

  // const SearchIconWrapper = styled('div')(({ theme }) => ({
  //   padding: theme.spacing(0, 2),
  //   height: '100%',
  //   position: 'absolute',
  //   pointerEvents: 'none',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // }));

  // const StyledInputBase = styled(InputBase)(({ theme }) => ({
  //   color: 'inherit', 
  //   '& .MuiInputBase-input': {
  //     padding: theme.spacing(1, 1, 1, 0),
  //     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  //     transition: theme.transitions.create('width'),
  //     width: '100%',
  //     [theme.breakpoints.up('md')]: {
  //       width: '20ch',
  //     },
  //   },
  // }));


  return (
    // className="navbar" can be removed if all styling is via MUI components & theme
    // The theme sets AppBar to white background, dark text, elevation 0
    <AppBar position="static" className="navbar-mui"> 
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
          FamilyTree
        </Typography>
        
        {/* Placeholder for search input if needed in future */}
        {/* <InputBase placeholder="Search…" sx={{ color: 'inherit', ml: 2, flex: 1 }} /> */}
        <Box sx={{ flexGrow: 1 }} /> {/* This Box will push actions to the right */}

        <IconButton color="inherit" aria-label="notifications">
          <NotificationsIcon />
        </IconButton>
        <Button color="inherit" startIcon={<AddIcon />}>
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
  );
}

// Helper 'styled' components (can be moved to a separate file or top of this file)
// This is a common pattern but requires @mui/system or @mui/styled-engine
// For simplicity, if these cause issues, I might remove them and use sx props.
// Let's assume they work for now.
// import { styled } from '@mui/material/styles'; // Moved to top
