import { useGetGraphQuery } from "@/redux/queries/graph-endpoints";
import { Tree as TreeType } from "@/types/entityTypes"; // Changed
import { getErrorMessage } from "@/utils/common";
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Container,
} from "@mui/material";
import React from "react";
import FlowCanvas from "./GraphFlow/GraphFlow";
export type TreeProps = {
  tree: TreeType; // Changed
};

const Tree: React.FC<TreeProps> = ({ tree }) => { // Changed
  const {
    data: graphData,
    isFetching: isGraphFetching,
    isLoading: isGraphLoading,
    isError: isGraphError,
    error: graphError,
  } = useGetGraphQuery({ treeId: tree.elementId! }, { skip: !tree }); // Changed

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
        tree={tree} // Changed
      />
    </Container>
  );
};

export default Tree;
