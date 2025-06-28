import { AppEdge, Edges } from "@/types/edgeTypes";
import { Tree } from "@/types/entityTypes";
import { AppNode, Nodes } from "@/types/nodeTypes";
import { getLayoutedElements } from "@/utils/layout";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export type TreeConfigState = {
  currentTree: Tree | null;
  nodes: AppNode[];
  edges: AppEdge[];
  filteredNodes: AppNode[];
  filteredEdges: AppEdge[];
  savedFilters: (FilterProps & { elementId: string })[];
  selectedFilter: { id: string; label: string } | null;
  currentFilter: FilterProps;
};

export type FilterProps = {
  filterName: string | null;
  enabled: boolean;
  filterBy: {
    edgeTypes: { [K in Edges]: boolean };
    nodeTypes: { [K in Nodes]: boolean };
    nodeProps: {
      house: {
        selectedHouses: { id: string; label: string }[];
      };
      person: {
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
      edgeTypes: {
        [Edges.BELONGS_TO]: true,
        [Edges.MARRIED_TO]: true,
        [Edges.PARENT_OF]: true,
      },
      nodeTypes: { [Nodes.Person]: true, [Nodes.House]: true },
      nodeProps: {
        house: {
          selectedHouses: [],
        },
        person: {
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
    setApplyFilters: (state) => {
      applyFilters(state);
    },
    setFilteredNodes: (state, action: PayloadAction<AppNode[]>) => {
      state.filteredNodes = action.payload;
    },
    setFilteredEdges: (state, action: PayloadAction<AppEdge[]>) => {
      state.filteredEdges = action.payload;
    },
    setSelectedFilter: (
      state,
      action: PayloadAction<{ id: string; label: string } | null>
    ) => {
      state.selectedFilter = action.payload;
    },
    setSavedFilters: (
      state,
      action: PayloadAction<(FilterProps & { elementId: string })[]>
    ) => {
      state.savedFilters = action.payload;
    },
    setCurrentFilter: (state, action: PayloadAction<FilterProps>) => {
      state.currentFilter = action.payload;
    },
  },
});

const getNodeIdsFromEdges = (
  state: TreeConfigState,
  edgeType: Edges,
  include: boolean = true
) => {
  const edges = state.edges;
  const localIds: string[] = [];
  edges
    .filter((edge) => edge.type === edgeType)
    .forEach((edge) => localIds.push(edge.source, edge.target));
  if (include) return localIds;
  const nodes = state.nodes;
  return nodes
    .filter((node) => !localIds.includes(node.id))
    .map((node) => node.id);
};

const validateAge = (range: number[], data: Record<string, any>) => {
  if (!data.dob) return range[1] - range[0] >= 90;
  const start = data.dob;
  const end = data.doe ?? new Date();

  const age = dayjs(end).diff(start, "year");

  return age >= range[0] && age <= range[1];
};
const applyFilters = (state: TreeConfigState) => {
  const currentFilter = state.currentFilter;
  const nodes = state.nodes;
  const edges = state.edges;

  if (!currentFilter.enabled) {
    state.filteredNodes = nodes;
    state.filteredEdges = edges;
    return;
  }

  const nodeIdsToRemove = [];

  /* Filter by nodeTypes */
  if (!currentFilter.filterBy.nodeTypes.House) {
    const localIdsToRemove = nodes
      .filter((node) => node.type === Nodes.House)
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as noteTypes.House: ${currentFilter.filterBy.nodeTypes.House}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }
  if (!currentFilter.filterBy.nodeTypes.Person) {
    const localIdsToRemove = nodes
      .filter((node) => node.type === Nodes.Person)
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as noteTypes.Person: ${currentFilter.filterBy.nodeTypes.Person}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  /* Filter by nodeProps */
  //House
  if (currentFilter.filterBy.nodeProps.house.selectedHouses.length > 0) {
    const selectedHouseIds =
      currentFilter.filterBy.nodeProps.house.selectedHouses.map(
        (house) => house.id
      );
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.House && !selectedHouseIds.includes(node.id)
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as nodeProps.house.selectedHouses: ${currentFilter.filterBy.nodeProps.house.selectedHouses}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }
  //Person
  const personFilters = currentFilter.filterBy.nodeProps.person;
  if (personFilters.married !== null) {
    const localIdsToRemove = getNodeIdsFromEdges(
      state,
      Edges.MARRIED_TO,
      !personFilters.married
    );
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.married: ${personFilters.married}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }
  if (personFilters.gender !== null) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          node.data.gender !== personFilters.gender
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.gender: ${personFilters.gender}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.age !== null) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          !validateAge(personFilters.age, node.data)
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.age: ${personFilters.age}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.bornAfter !== null) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          (!node.data.dob || node.data.dob < personFilters.bornAfter!)
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.bornAfter: ${personFilters.bornAfter}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.bornBefore !== null) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          (!node.data.dob || node.data.dob > personFilters.bornBefore!)
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.bornBefore: ${personFilters.bornBefore}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.isAlive !== null) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          ((personFilters.isAlive && node.data.isAlive === "No") ||
            (!personFilters.isAlive && node.data.isAlive === "Yes"))
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.isAlive: ${personFilters.isAlive}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.jobTypes.length > 0) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          (!node.data.job?.jobType ||
            !personFilters.jobTypes.includes(node.data.job?.jobType))
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.jobTypes: ${personFilters.jobTypes}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.studies.length > 0) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          (!node.data.education?.fieldOfStudy ||
            !personFilters.studies.includes(node.data.education.fieldOfStudy))
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.studies: ${personFilters.studies}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.qualifications.length > 0) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          (!node.data.education?.highestQualification ||
            !personFilters.qualifications.includes(
              node.data.education.highestQualification
            ))
      )
      .map((node) => node.id);
    console.log(
      `remove ${localIdsToRemove.length} nodes as personFilters.qualifications: ${personFilters.qualifications}`
    );
    nodeIdsToRemove.push(...localIdsToRemove);
  }

  // process the nodes and edges
  const excludeNodeIds = [...new Set(nodeIdsToRemove)];

  const edgeIdsToRemove = edges
    .filter(
      (edge) =>
        excludeNodeIds.includes(edge.source) ||
        excludeNodeIds.includes(edge.target)
    )
    .map((edge) => edge.id);

  const excludeEdgeIds = [...new Set(edgeIdsToRemove)];

  const fEdges = edges.filter((edge) => !excludeEdgeIds.includes(edge.id));
  const fNodes = nodes.filter((node) => !excludeNodeIds.includes(node.id));
  const { nodes: filteredNodes, edges: filteredEdges } = getLayoutedElements(
    fNodes,
    fEdges // Use the processed edges
  );
  state.filteredEdges = filteredEdges;
  state.filteredNodes = filteredNodes;
};

export const selectTree = (state: ParameterSetState) =>
  state.treeConfig.currentTree;
export const selectNodes = (state: ParameterSetState) => state.treeConfig.nodes;
export const selectEdges = (state: ParameterSetState) => state.treeConfig.edges;
export const selectFilteredNodes = (state: ParameterSetState) =>
  state.treeConfig.filteredNodes;
export const selectFilteredEdges = (state: ParameterSetState) =>
  state.treeConfig.filteredEdges;
export const selectSavedFilters = (state: ParameterSetState) =>
  state.treeConfig.savedFilters;
export const selectSelectedFilter = (state: ParameterSetState) =>
  state.treeConfig.selectedFilter;
export const selectCurrentFilter = (state: ParameterSetState) =>
  state.treeConfig.currentFilter;

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setFilteredNodes,
  setFilteredEdges,
  setApplyFilters,
  setSelectedFilter,
  setSavedFilters,
  setCurrentFilter,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
