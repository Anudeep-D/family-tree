import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#B2D8D8", // Pastel Blue
      light: "#E0F2F1",
      dark: "#82A7A7",
      contrastText: "#5C5C5C",
    },
    secondary: {
      main: "#F0E68C", // Khaki
      light: "#FFF9C4",
      dark: "#BDAE5E",
      contrastText: "#5C5C5C",
    },
    error: {
      main: "#FF6B6B", // A soft red
    },
    warning: {
      main: "#FFD54F", // A soft yellow
    },
    info: {
      main: "#81C784", // A soft green
    },
    success: {
      main: "#A5D6A7", // A soft green
    },
    background: {
      default: "#FAF9F6", // Off-white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#5C5C5C",
      secondary: "#8E8E8E",
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
    MuiContainer: {
      defaultProps: {
        maxWidth: false,
      },
    },
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
          borderRadius: 15,
          textTransform: "none",
          padding: "10px 24px",
          fontWeight: 600,
          transition: "all 0.3s ease",
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
        outlinedPrimary: {
          borderRadius: 10,
          padding: "5px 10px",
          fontSize: "0.7rem",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "#fff",
          boxShadow:
            "0 4px 12px rgba(42, 82, 152, 0.6), inset 0 0 8px rgba(255,255,255,0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(4px)",
          "&:hover": {
            background: "linear-gradient(135deg, #2a5298, #1e3c72)",
            boxShadow:
              "0 6px 16px rgba(42, 82, 152, 0.8), inset 0 0 10px rgba(255,255,255,0.2)",
            transform: "scale(1.03)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        },
        disableElevation: {
          color: "#a0a4a7",
        },
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
