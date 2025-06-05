import React from "react";
import { useLogoutMutation } from "@/redux/queries/auth-endpoints";
import "./Navbar.scss";

export default function Navbar() {
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">FamilyTree</div>
      <div className="navbar__actions">
        <button className="navbar__btn">🔔</button>
        <button className="navbar__btn">➕ New Project</button>
        <div className="navbar__profile">👤 My Profile</div>
        <button className="navbar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
