import { useState } from "react";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import {Home as HomeIcon} from "@mui/icons-material";
import Navbar from "./NavBar/Navbar";
import Tree from "./Tree/Tree";
import Projects from "./Projects/Projects";
import { Project } from "@/types/entityTypes";
import "./Home.scss";
export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined
  );

  return (
    <Box>
      <Navbar />
      <Box className="breadcrumbs-container">
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            className="breadcrumb-link"
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => setSelectedProject(undefined)}
          >
            <HomeIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: 4 }} />
            Home
          </Link>
          {selectedProject && (
            <Typography className="breadcrumb-current">
              {selectedProject.name}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>
      {selectedProject ? (
        <Tree />
      ) : (
        <Projects setSelectedProject={setSelectedProject} />
      )}
    </Box>
  );
}
