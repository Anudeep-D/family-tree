import { AppEdge } from "@/types/edgeTypes";
import { Tree } from "@/types/entityTypes";
import { AppNode } from "@/types/nodeTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TreeConfigState = {
  currentTree: Tree | null;
  nodes: AppNode[];
  edges: AppEdge[];
  filteredNodes: AppNode[];
  filteredEdges: AppEdge[];
  selectedFilters: object | any[];
  selectedRoot: AppNode | null;
}
type ParameterSetState = {
  treeConfig: TreeConfigState;
};
const initialState: TreeConfigState = {
  currentTree: null,
  nodes: [],
  edges: [],
  filteredNodes: [],
  filteredEdges: [],
  selectedFilters: {},
  selectedRoot: null,
};

const treeConfigSlice = createSlice({
  name: "treeConfig",
  initialState,
  reducers: {
    setCurrentTree: (state, action: PayloadAction<Tree | null>) => {
      state.currentTree = action.payload;
    },
    setReduxNodes: (state, action: PayloadAction<AppNode[]>) => {
      state.nodes = action.payload;
    },
    setReduxEdges: (state, action: PayloadAction<AppEdge[]>) => {
      state.edges = action.payload;
    },
    setFilteredNodes: (state, action: PayloadAction<AppNode[]>) => {
      state.filteredNodes = action.payload;
    },
    setFilteredEdges: (state, action: PayloadAction<AppEdge[]>) => {
      state.filteredEdges = action.payload;
    },
    setSelectedFilters: (state, action: PayloadAction<object | any[]>) => {
      state.selectedFilters = action.payload;
    },
    setSelectedRoot: (state, action: PayloadAction<AppNode | null>) => {
      state.selectedRoot = action.payload;
    },
  },
});

export const selectTree = (state: ParameterSetState) => state.treeConfig.currentTree;
export const selectNodes = (state: ParameterSetState) => state.treeConfig.nodes;
export const selectEdges = (state: ParameterSetState) => state.treeConfig.edges;
export const selectFilters = (state: ParameterSetState) => state.treeConfig.selectedFilters;
export const selectRoot = (state: ParameterSetState) => state.treeConfig.selectedRoot;

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setSelectedFilters,
  setSelectedRoot,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
