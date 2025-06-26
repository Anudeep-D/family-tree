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
  selectedFilters: object | any[];
  filters: FilterProps;
};

export type FilterProps = {
  enabled: boolean;
  filterBy: {
    nodeTypes: { [K in Nodes]: boolean };
    nodeProps: {
      [Nodes.House]: {
        names: string[];
      };
      [Nodes.Person]: {
        married: boolean | null;
        gender: "male" | "female" | null;
        age: { start: number; end: number };
        bornAfter: Date | null;
        bornBefore: Date | null;
        isAlive: boolean | null;
        jobType: string[];
        study: string[];
        qualification: string[];
      };
    };
    rootPerson: {
      person: string | null;
      onlyImmediate: boolean;
    };
  };
};
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
  filters: {
    enabled: false,
    filterBy: {
      nodeTypes: { [Nodes.Person]: true, [Nodes.House]: true },
      nodeProps: {
        [Nodes.House]: {
          names: [],
        },
        [Nodes.Person]: {
          married: null,
          gender: null,
          age: { start: 0, end: 100 },
          bornAfter: null,
          bornBefore: null,
          isAlive: null,
          jobType: [],
          study: [],
          qualification: [],
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
    setSelectedFilters: (state, action: PayloadAction<object | any[]>) => {
      state.selectedFilters = action.payload;
    },
  },
});

export const selectTree = (state: ParameterSetState) =>
  state.treeConfig.currentTree;
export const selectNodes = (state: ParameterSetState) => state.treeConfig.nodes;
export const selectEdges = (state: ParameterSetState) => state.treeConfig.edges;
export const selectFilters = (state: ParameterSetState) =>
  state.treeConfig.selectedFilters;

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setSelectedFilters,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
