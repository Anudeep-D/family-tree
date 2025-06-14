import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "@routes/Home/Home";
import LoginPage from "@routes/Authentication/Login";
import PrivateRoute from "@routes/Authentication/PrivateRoute";

const clientId = `${process.env.GOOGLE_CLIENT_ID}`;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/trees/:treeId" // Changed from /trees/:treeId
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
