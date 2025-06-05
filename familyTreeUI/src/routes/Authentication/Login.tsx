import { useEffect } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Adjust path if useAuth is elsewhere
import "./Login.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, redirectPath, isLoading, setRedirectPath } =
    useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const path = redirectPath || "/";
      navigate(path, { replace: true });
      setRedirectPath(null); // Clear the redirect path after using it
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, setRedirectPath]);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        // The login function from useAuth should ideally handle the API call and token storage.
        // We pass the credential to it.
        await login(credentialResponse.credential);
      } catch (err) {
        console.error("Login failed:", err);
        // Optionally, display an error message to the user on the login page
      }
    } else {
      console.error("Google login failed: No credential returned");
    }
  };

  const handleLoginError = () => {
    console.error("Google login failed");
    // Optionally, display an error message to the user
  };

  // If loading auth state, or if already authenticated and waiting for redirect,
  // show a loading message or nothing to prevent flicker.
  if (isLoading || isAuthenticated) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="login-page-container">
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 8, // Margin top to push the paper down a bit
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Placeholder for an image or GIF */}
          {/* e.g., <img src="/path-to-your-image.png" alt="Family Tree Illustration" style={{ marginBottom: '16px', width: '100px', height: '100px' }} /> */}

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Welcome to FamilyTreeApp!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
            Connect with your history. Build your family tree, share with loved
            ones, and discover your roots.
          </Typography>

          <Box sx={{ mt: 2 }}>
            {" "}
            {/* Added Box for margin around GoogleLogin */}
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              // theme="filled_blue" // Example: Check documentation for available props
              // shape="rectangular"
              // width="280px"
            />
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage;
