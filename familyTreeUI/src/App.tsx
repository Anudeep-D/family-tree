import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./routes/Home/Home";
import LoginPage from "./routes/Authentication/Login";

const clientId = `${process.env.GOOGLE_CLIENT_ID}`;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
