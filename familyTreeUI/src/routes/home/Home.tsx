import "@xyflow/react/dist/style.css";
import { AppNode } from "@/types/nodeTypes";
import { AppEdge } from "@/types/edgeTypes";
import { useGetGraphQuery } from "@/redux/queries/graph-endpoints";
import { GraphFlow } from "./GraphFlow/GraphFlow";
import { useEffect } from "react";
import { useFetchSessionUserQuery } from "@/redux/queries/auth-endpoints";
import { useNavigate } from "react-router-dom";

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
  const {
    data: user,
    error: loginError,
    isLoading: isLoginLoading,
  } = useFetchSessionUserQuery();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoginLoading) {
      if (!user) {
        navigate("/login"); // 🔁 redirect if no valid session
      }
    }
  }, [user, isLoginLoading]);

  if (isLoginLoading) return <p>Loading...</p>;
  if (loginError || !user) {
    console.log("loginError",loginError);
    navigate("/login");
  }
  
  const { data, isFetching, isLoading, isError, error } = useGetGraphQuery({projectId:"projectId"});
  useEffect(() => {
    if (isError) {
      console.log("isError", error);
    } else if (!isFetching && !isLoading) {
      console.log(data);
    } else {
      console.log("isFetching: ", isFetching, " ,isLoading", isLoading);
    }
  }, [data, isFetching, isLoading, isError]);

  return <>{user ? <GraphFlow initialEdges={initialEdges} initialNodes={initialNodes} /> : navigate("/login")}</>;
};

export default Home;
