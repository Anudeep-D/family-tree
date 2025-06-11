import { useGetGraphQuery } from "@/redux/queries/graph-endpoints";
import { Project } from "@/types/entityTypes";
import { getErrorMessage } from "@/utils/common";
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Container,
} from "@mui/material";
import React from "react";
import FlowCanvas from "../GraphFlow/GraphFlow";
export type TreeProps = {
  project: Project;
};

const Tree: React.FC<TreeProps> = ({ project }) => {
  const {
    data: graphData,
    isFetching: isGraphFetching,
    isLoading: isGraphLoading,
    isError: isGraphError,
    error: graphError,
  } = useGetGraphQuery({ projectId: project.elementId! });

  if (isGraphFetching || isGraphLoading)
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  if (isGraphError)
    return (
      <Alert severity="error">
        <AlertTitle>Failed to fetch graph</AlertTitle>
        {getErrorMessage(graphError)}
      </Alert>
    );
  return (
    <Container sx={{ maxWidth: "100% !important" }}>
      <FlowCanvas
        initialNodes={graphData?.nodes ?? []}
        initialEdges={graphData?.edges ?? []}
      />
    </Container>
  );
};

export default Tree;
