import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { useFetchSessionUserQuery } from "@/redux/queries/auth-endpoints";
import { useNavigate } from "react-router-dom";

import "./Home.scss";
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Navbar from "./NavBar/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const {
    data: user,
    error: loginError,
    isLoading: isLoginLoading,
  } = useFetchSessionUserQuery();

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    if (!isLoginLoading && (!user || loginError)) {
      navigate("/login");
    }
  }, [user, isLoginLoading, loginError, navigate]);

  if (isLoginLoading) {
    return <p>Loading session...</p>;
  }

  if (loginError || !user) {
    return <p>Redirecting to login...</p>;
  }

  const allProjects = [
    { id: "1", name: "Admin Project Alpha", access: "Admin" },
    { id: "2", name: "Admin Project Beta", access: "Admin" },
    { id: "3", name: "Editor Project Alpha", access: "Editor" },
    { id: "4", name: "Editor Project Beta", access: "Editor" },
    { id: "5", name: "Viewer Project Alpha", access: "Viewer" },
    { id: "6", name: "Viewer Project Beta", access: "Viewer" },
  ];

  const filteredProjects = allProjects.filter(
    (project) =>
      (!search || project.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterRole || project.access === filterRole)
  );

  const toggleSelect = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleDelete = () => {
    console.log("Delete projects:", selectedProjectIds);
    // Add delete logic here
  };

  return (
    <div className="home">
      <Navbar />
      <Breadcrumb />
      <div className="home__content">
        <h1>Welcome, {user.name}</h1>

        <div className="home__table-controls">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {selectedProjectIds.length > 0 && (
          <div className="home__bulk-actions">
            <button onClick={handleDelete}>Delete</button>
            <button onClick={() => setSelectedProjectIds([])}>Cancel</button>
          </div>
        )}

        <table className="home__project-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedProjectIds.length === filteredProjects.length &&
                    filteredProjects.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project: any) => (
              <tr key={project.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.includes(project.id)}
                    onChange={() => toggleSelect(project.id)}
                  />
                </td>
                <td>{project.name}</td>
                <td>{project.access}</td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={3}>No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
