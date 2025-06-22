import { AppEdge } from '@/types/edgeTypes';
import { Tree } from '@/types/entityTypes';
import { AppNode } from '@/types/nodeTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  currentTree: Tree | null;
  nodes: AppNode[];
  edges: AppEdge[];
  selectedFilters: object | any[];
  selectedRoot: AppNode | null;
}

const initialState: AppState = {
  currentTree: null,
  nodes: [],
  edges: [],
  selectedFilters: {},
  selectedRoot: null,
};

const treeConfigSlice = createSlice({
  name: 'treeConfig',
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
    setSelectedFilters: (state, action: PayloadAction<object | any[]>) => {
      state.selectedFilters = action.payload;
    },
    setSelectedRoot: (state, action: PayloadAction<AppNode | null>) => {
      state.selectedRoot = action.payload;
    },
  },
});

export const selectTree = (state: AppState) => state.currentTree;
export const selectNodes = (state: AppState) => state.nodes;
export const selectEdges = (state: AppState) => state.edges;
export const selectFilters = (state: AppState) => state.selectedFilters;
export const selectRoot = (state: AppState) => state.selectedRoot;

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setSelectedFilters,
  setSelectedRoot,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
