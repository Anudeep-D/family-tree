import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Adjust path if useAuth is elsewhere
import { Box, CircularProgress } from "@mui/material";
import "@styles/global.scss";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, setRedirectPath } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setRedirectPath(location.pathname + location.search);
    }
  }, [isAuthenticated, isLoading, location, setRedirectPath]);

  if (isLoading) {
    // Optional: Show a loading spinner or a blank page while checking auth
    // For now, returning null or a simple loading indicator
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children components
  return children;
};

export default PrivateRoute;
