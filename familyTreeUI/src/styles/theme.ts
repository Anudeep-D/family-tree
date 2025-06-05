import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // A warm, inviting green
    },
    secondary: {
      main: '#FFC107', // A complementary amber/yellow
    },
    background: {
      default: '#f5f5f5', // Light grey background for contrast
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h5: { fontSize: '1.5rem', fontWeight: 500 }, // Used in Home.tsx
    // Define other typography variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly more rounded buttons
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    }
  }
});

export default theme;
