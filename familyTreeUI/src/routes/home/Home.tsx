import { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Breadcrumbs,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";
import Navbar from "./NavBar/Navbar";
import Tree from "./Tree/Tree";
import Projects from "./Projects/Projects";
import { Project } from "@/types/entityTypes";
import "./Home.scss";
import { useGetProjectQuery } from "@/redux/queries/project-endpoints";
import { getErrorMessage } from "@/utils/common";
import { useNavigate, useParams } from "react-router-dom";
export default function Home() {
  const { projectId: encodedId } = useParams<{ projectId: string }>();
  const projectId = encodedId && decodeURIComponent(encodedId!);
  const navigate = useNavigate();
  const {
    data: project,
    isFetching: isProjectFetching,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: ProjectError,
  } = useGetProjectQuery({ projectId: projectId! }, { skip: !projectId });

  useEffect(() => {
    if (projectId && (isProjectFetching || isProjectLoading))
      setisLoading(true);
    else setisLoading(false);
  }, [
    projectId,
    project,
    isProjectFetching,
    isProjectLoading,
    isProjectError,
    ProjectError,
  ]);

  const [isLoading, setisLoading] = useState<boolean>(false);

  const handleProjectSelection = (project: Project) => {
    navigate(`/projects/${encodeURIComponent(project.elementId!)}`);
  };
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
            onClick={() => navigate(`/`)}
          >
            <HomeIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
            Home
          </Link>
          {project && (
            <Typography className="breadcrumb-current">
              {project.name}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>
      {isLoading && (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      )}
      {projectId && isProjectError && (
        <Alert severity="error">
          <AlertTitle>Failed to fetch graph</AlertTitle>
          {getErrorMessage(ProjectError)}
        </Alert>
      )}
      {projectId && project && <Tree project={project} />}

      {!projectId && (
        <Projects handleProjectSelection={handleProjectSelection} />
      )}
    </Box>
  );
}
