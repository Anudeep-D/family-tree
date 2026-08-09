import { useEffect, useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import "./Login.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, redirectPath, isLoading, setRedirectPath } =
    useAuth();
  const [isFirebaseLoginLoading, setIsFirebaseLoginLoading] = useState(false);

  // Active provider setting from env (FIREBASE by default)
  const authProvider = import.meta.env.VITE_AUTH_PROVIDER || "FIREBASE";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const path = redirectPath || "/";
      navigate(path, { replace: true });
      setRedirectPath(null);
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, setRedirectPath]);

  // Google OAuth Success Handler
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await login(credentialResponse.credential);
      } catch (err) {
        console.error("Login failed:", err);
      }
    } else {
      console.error("Google login failed: No credential returned");
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed");
  };

  // Firebase Popup Login Handler
  const handleFirebaseLogin = async () => {
    try {
      setIsFirebaseLoginLoading(true);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      await login(idToken);
    } catch (error) {
      console.error("Firebase Google login failed:", error);
    } finally {
      setIsFirebaseLoginLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <img
        src="/images/bg.png"
        alt="Family Tree Illustration"
        className="login-page-bg"
      />
      <div className="login-page-container">
        <Container maxWidth="sm">
          <Paper
            className="login-paper"
            elevation={3}
            sx={{
              p: 4,
              mt: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              Welcome to FamilyTreeApp!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Connect with your history. Build your family tree, share with
              loved ones, and discover your roots.
            </Typography>

            <Box sx={{ mt: 2 }}>
              {authProvider === "FIREBASE" ? (
                <Button
                  variant="contained"
                  onClick={handleFirebaseLogin}
                  disabled={isFirebaseLoginLoading}
                  sx={{
                    backgroundColor: "#4285F4",
                    color: "#fff",
                    px: 3,
                    py: 1.2,
                    borderRadius: 5,
                    textTransform: "none",
                    fontSize: "16px",
                    boxShadow: 2,
                    "&:hover": {
                      backgroundColor: "#357ae8",
                    },
                  }}
                >
                  {isFirebaseLoginLoading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Sign in with Google (Firebase)"
                  )}
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme="filled_blue"
                  shape="pill"
                  width={280}
                />
              )}
            </Box>
          </Paper>
        </Container>
      </div>
    </>
  );
};

export default LoginPage;
