import { useGetGraphQuery } from "@/redux/queries/graph-endpoints";
import { Project } from "@/types/entityTypes";
import { getErrorMessage } from "@/utils/common";
import { Alert, AlertTitle, CircularProgress, Container } from "@mui/material";
import React from "react";
import { GraphFlow } from "../GraphFlow/GraphFlow";
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

  if (isGraphFetching || isGraphLoading) return <CircularProgress />;
  if (isGraphError)
    return (
      <Alert severity="error">
        <AlertTitle>Failed to fetch graph</AlertTitle>
        {getErrorMessage(graphError)}
      </Alert>
    );
  return (
    <Container sx={{ height: '85vh', width: '100%', maxWidth:'100% !important' }}>
      {graphData?.nodes && graphData?.nodes.length > 0 ? (
        <GraphFlow
          initialNodes={graphData.nodes}
          initialEdges={graphData.edges}
        />
      ) : (
        "no graph present"
      )}
    </Container>
  );
};

export default Tree;
