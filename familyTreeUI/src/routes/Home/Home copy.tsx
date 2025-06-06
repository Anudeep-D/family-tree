import "@xyflow/react/dist/style.css";
import { AppNode } from "@/types/nodeTypes";
import { AppEdge } from "@/types/edgeTypes";
import { useGetGraphQuery } from "@/redux/queries/project-endpoints";
import { GraphFlow } from "./GraphFlow/GraphFlow";
import { useEffect } from "react";
import { useFetchSessionUserQuery } from "@/redux/queries/auth-endpoints";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query/react";

// Sample custom nodes
export const initialNodes: AppNode[] = [
  {
    id: "1",
    type: "position-logger",
    data: { label: "Root Node" },
    position: { x: 100, y: 100 },
  },
  {
    id: "2",
    type: "position-logger",
    data: { label: "Child Node" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "position-logger",
    data: { label: "Sibling Node" },
    position: { x: 100, y: 100 },
  },
];

// Sample custom edges
export const initialEdges: AppEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    sourceHandle: "b",
    targetHandle: "a",
    type: "labeled-edge",
    data: { label: "PARENT_OF" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    sourceHandle: "b",
    targetHandle: "a",
    type: "labeled-edge",
    data: { label: "PARENT_OF" },
  },
];
const Home = () => {
  const navigate = useNavigate();
  const {
    data: user,
    error: loginError,
    isLoading: isLoginLoading,
  } = useFetchSessionUserQuery();

  // Prepare arguments for useGetGraphQuery, but call the hook unconditionally.
  const getGraphQueryArg = user?.elementId ? { projectId: "projectId" } : skipToken;
  const {
    data: graphData,
    isFetching: isGraphFetching,
    isLoading: isGraphLoading,
    isError: isGraphError,
    error: graphError,
  } = useGetGraphQuery(getGraphQueryArg);

  useEffect(() => {
    if (!isLoginLoading && (!user || loginError)) {
      navigate("/login");
    }
  }, [user, isLoginLoading, loginError, navigate]);

  useEffect(() => {
    if (isGraphError) {
      console.log("Graph query error:", graphError);
      // Potentially navigate to an error page or show an error message
    }
  }, [isGraphError, graphError]); // Removed navigate from dependencies as it's not used here

  if (isLoginLoading) {
    return <p>Loading session...</p>;
  }

  if (loginError || !user) {
    return <p>Redirecting to login...</p>;
  }

  if (isGraphLoading || isGraphFetching) {
    return <p>Loading graph data...</p>;
  }

  if (isGraphError) {
    return <p>Error loading graph data. Please try again later.</p>;
  }
  
  if (user && graphData) {
    return <GraphFlow initialEdges={initialEdges} initialNodes={initialNodes} />;
  }

  // Fallback case, though ideally covered by previous checks
  return <p>Preparing your experience...</p>;
};

export default Home;
