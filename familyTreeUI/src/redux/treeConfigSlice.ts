import { AppEdge } from "@/types/edgeTypes";
import { Tree } from "@/types/entityTypes";
import { AppNode, Nodes } from "@/types/nodeTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TreeConfigState = {
  currentTree: Tree | null;
  nodes: AppNode[];
  edges: AppEdge[];
  filteredNodes: AppNode[];
  filteredEdges: AppEdge[];
  savedFilters: { id: string; data: FilterProps }[];
  selectedFilter: { id: string; label: string } | null;
  currentFilter: FilterProps;
};

export type FilterProps = {
  filterName: string | null;
  enabled: boolean;
  filterBy: {
    nodeTypes: { [K in Nodes]: boolean };
    nodeProps: {
      [Nodes.House]: {
        selectedHouses: { id: string; label: string }[];
      };
      [Nodes.Person]: {
        married: boolean | null;
        gender: "male" | "female" | null;
        age: number[];
        bornAfter: Date | null;
        bornBefore: Date | null;
        isAlive: boolean | null;
        jobTypes: { id: string; label: string; group: string }[];
        studies: { id: string; label: string; group: string }[];
        qualifications: { id: string; label: string; group: string }[];
      };
    };
    rootPerson: {
      person: { id: string; label: string } | null;
      onlyImmediate: boolean;
    };
  };
};
type ParameterSetState = {
  treeConfig: TreeConfigState;
};
export const initialState: TreeConfigState = {
  currentTree: null,
  nodes: [],
  edges: [],
  filteredNodes: [],
  filteredEdges: [],
  savedFilters: [],
  selectedFilter: null,
  currentFilter: {
    filterName: null,
    enabled: false,
    filterBy: {
      nodeTypes: { [Nodes.Person]: true, [Nodes.House]: true },
      nodeProps: {
        [Nodes.House]: {
          selectedHouses: [],
        },
        [Nodes.Person]: {
          married: null,
          gender: null,
          age: [0, 100],
          bornAfter: null,
          bornBefore: null,
          isAlive: null,
          jobTypes: [],
          studies: [],
          qualifications: [],
        },
      },
      rootPerson: {
        person: null,
        onlyImmediate: false,
      },
    },
  },
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
    setSelectedFilter: (state, action: PayloadAction<{ id: string; label: string } | null>) => {
      state.selectedFilter = action.payload;
    },
    setSavedFilters: (state, action: PayloadAction<{ id: string; data: FilterProps }[]>) => {
      state.savedFilters = action.payload;
    },
    setCurrentFilter: (state, action: PayloadAction<FilterProps>) => {
      state.currentFilter = action.payload;
    },
  },
});

export const selectTree = (state: ParameterSetState) =>
  state.treeConfig.currentTree;
export const selectNodes = (state: ParameterSetState) => state.treeConfig.nodes;
export const selectEdges = (state: ParameterSetState) => state.treeConfig.edges;
export const selectSavedFilters = (state: ParameterSetState) => state.treeConfig.savedFilters;
export const selectSelectedFilter = (state: ParameterSetState) =>
  state.treeConfig.selectedFilter;
export const selectCurrentFilter = (state: ParameterSetState) =>
  state.treeConfig.currentFilter;

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setSelectedFilter,
  setSavedFilters,
  setCurrentFilter,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
