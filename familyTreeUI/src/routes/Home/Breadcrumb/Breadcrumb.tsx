import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./Breadcrumb.scss";

export default function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link>
      {parts.map((part, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/");
        return (
          <React.Fragment key={i}>
            <span className="breadcrumbSeparator">/</span>
            <Link to={path}>{decodeURIComponent(part)}</Link>
          </React.Fragment>
        );
      })}
    </div>
  );
}