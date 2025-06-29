import { useGetFamilyTreeQuery } from "@/redux/queries/graph-endpoints";
import {
  RootedGraphProps,
  selectCurrentFilter,
  selectTree,
  setRootedGraph,
} from "@/redux/treeConfigSlice";
import { getErrorMessage } from "@/utils/common";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useRootPersonGraph = (
  rootId: string | undefined,
  isImmediate: boolean
) => {
  const dispatch = useDispatch();
  const tree = useSelector(selectTree);
  const currentFilter = useSelector(selectCurrentFilter);
  const {
    data: graphData,
    isFetching: isGraphFetching,
    isLoading: isGraphLoading,
    isError: isGraphError,
    error: graphError,
  } = useGetFamilyTreeQuery(
    { treeId: tree!.elementId!, isImmediate: isImmediate, id: rootId! },
    { skip: rootId === undefined || !currentFilter.enabled }
  );

  useEffect(() => {
    if (rootId === undefined || !currentFilter.enabled) {
      dispatch(setRootedGraph(undefined));
    } else {
      const initGraph: RootedGraphProps = {
        nodes: [],
        edges: [],
        isloading: true,
      };
      if (isGraphError) {
        initGraph.isloading = false;
        initGraph.error = getErrorMessage(graphError);
      } else if (graphData) {
        console.log("graphData:", graphData);
        initGraph.isloading = false;
        initGraph.edges = graphData.edges;
        initGraph.nodes = graphData.nodes;
      }
      dispatch(setRootedGraph(initGraph));
    }
  }, [
    currentFilter.enabled,
    rootId,
    graphData,
    isGraphFetching,
    isGraphLoading,
    isGraphError,
    graphError,
  ]);
};

export default useRootPersonGraph;
