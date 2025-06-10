import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0070E0", // Indigo 900
      light: "#534BAE", // Lighter shade for Indigo 900
      dark: "#000051", // Darker shade for Indigo 900
      contrastText: "#fff",
    },
    secondary: {
      main: "#00ACC1", // Cyan 600
      light: "#5DDEF4", // Lighter shade for Cyan 600
      dark: "#007C91", // Darker shade for Cyan 600
      contrastText: "#000", // Text might need to be dark for this vibrant teal
    },
    error: {
      main: "#EA4335", // Keep or adjust if needed for dark theme
    },
    warning: {
      main: "#FBBC05", // Keep or adjust if needed for dark theme
    },
    info: {
      main: "#34A853", // Google Green, consider a lighter shade for dark mode if needed
    },
    success: {
      main: "#0F9D58", // Keep or adjust if needed for dark theme
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#E0E0E0",
      secondary: "#B0B0B0",
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.015em" },
    h2: { fontSize: "2.25rem", fontWeight: 600 },
    h3: { fontSize: "2rem", fontWeight: 600 },
    h4: { fontSize: "1.75rem", fontWeight: 500 },
    h5: { fontSize: "1.5rem", fontWeight: 500 },
    h6: { fontSize: "1.25rem", fontWeight: 500 },
    subtitle1: { fontSize: "1rem", fontWeight: 400 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
    body1: { fontSize: "1rem", fontWeight: 400 },
    body2: { fontSize: "0.875rem", fontWeight: 400 },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    caption: { fontSize: "0.75rem", fontWeight: 400 },
    overline: {
      fontSize: "0.625rem",
      fontWeight: 500,
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#121212", // Match new background.default
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#1E1E1E", // Use paper background or another dark color
          color: "#E0E0E0", // Use new text.primary
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2, // Keep or adjust elevation for dark theme
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          // boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)", // Original shadow, might need adjustment
          backgroundColor: "#1E1E1E", // Use new paper background
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 3, // Keep or adjust elevation
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          // backdropFilter: "blur(8px)", // Remove or adjust for dark theme, glassmorphism might not fit
          backgroundColor: "#1E1E1E", // Use new paper background
          // boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", // Remove or adjust, less prominent shadows in dark
          // border: "1px solid rgba(255, 255, 255, 0.3)", // Remove or adjust border
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: "none",
          padding: "10px 24px",
          fontWeight: 600,
        },
        containedPrimary: {
          // Example: Darker gradient for the new primary
          background: "linear-gradient(45deg, #266798, #000051)",
          color: "#fff", // contrastText for primary
          boxShadow: "0px 4px 10px rgba(26, 35, 126, 0.5)", // Adjusted shadow for the new primary
          "&:hover": {
            background: "linear-gradient(45deg, #000051, #266798)", // Slightly different gradient on hover
          },
        },
        disableElevation: {
            color:"#a0a4a7"
        }
      },
    },

    MuiTypography: {
      styleOverrides: {
        h4: {
          color: "#E0E0E0", // Use new text.primary
          fontWeight: 700,
        },
        body1: {
          color: "#E0E0E0", // Use new text.primary
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#333333",
          input: {
            color: "#E0E0E0",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#1E1E1E", // Dark background for table head
          fontWeight: 600,
          color: "#E0E0E0", // Use new text.primary
        },
        root: {
          padding: "12px 16px",
          borderBottom: "1px solid #303030", // Darker border for dark theme
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#2A2A2A", // Slightly lighter than paper for hover
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#2A2A2A",
          color: "#ffffff",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333",
          borderRadius: 8,
        },
        inputRoot: {
          color: "#fff",
        },
        popupIndicator: {
          color: "#E0E0E0",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: "#2A2A2A",
          color: "#E0E0E0",
          "&:hover": {
            backgroundColor: "#3a3a3a",
          },
          "&[aria-selected='true']": {
            backgroundColor: "#1A237E",
            color: "#fff",
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#B0B0B0",
          "&.Mui-focused": {
            color: "#E0E0E0",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#555",
        },
        root: {
          borderRadius: 10,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#888",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00ACC1",
          },
        },
        input: {
          color: "#E0E0E0",
        },
      },
    },
  },
});

export default theme;
