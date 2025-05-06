import "@xyflow/react/dist/style.css";
import { AppNode } from "@/types/nodeTypes";
import { AppEdge } from "@/types/edgeTypes";
import { useGetGraphQuery } from "@/redux/queries/graph-endpoints";
import { GraphFlow } from "./ReactFlow/GraphFlow";
import { useEffect } from "react";

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
  const { data, isFetching, isLoading, isError, error } = useGetGraphQuery({});
  useEffect(() => {
    if (isError) {
      console.log("isError", error);
    } else if (!isFetching && !isLoading) {
      console.log(data);
    } else {
      console.log("isFetching: ", isFetching, " ,isLoading", isLoading);
    }
  }, [data, isFetching, isLoading, isError]);
  return <GraphFlow initialEdges={initialEdges} initialNodes={initialNodes} />;
};

export default Home;
