import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4285F4", // Google Blue
      light: "#8AB4F8",
      dark: "#1a73e8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#DB4437", // Google Red
      light: "#F28B82",
      dark: "#C53929",
      contrastText: "#fff",
    },
    error: {
      main: "#EA4335",
    },
    warning: {
      main: "#FBBC05",
    },
    info: {
      main: "#34A853", // Google Green
    },
    success: {
      main: "#0F9D58",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
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
          backgroundColor: "#FAFAFA",
        },
      },
    },

    MuiAppBar: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#ffffff",
          color: "#1f1f1f",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 3,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
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
          background: "linear-gradient(45deg, #4285F4, #34A853)",
          color: "#fff",
          boxShadow: "0px 4px 10px rgba(66, 133, 244, 0.3)",
          "&:hover": {
            background: "linear-gradient(45deg, #357ae8, #2e7d32)",
          },
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        h4: {
          color: "#1a1a1a",
          fontWeight: 700,
        },
        body1: {
          color: "#333333",
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
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#F1F3F4",
          fontWeight: 600,
          color: "#202124",
        },
        root: {
          padding: "12px 16px",
          borderBottom: "1px solid #E0E0E0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;
