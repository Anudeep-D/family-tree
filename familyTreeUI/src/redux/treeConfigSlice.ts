import { AppEdge, Edges } from "@/types/edgeTypes";
import { Tree } from "@/types/entityTypes";
import { AppNode, Nodes } from "@/types/nodeTypes";
import { getDiff } from "@/utils/common";
import { getLayoutedElements } from "@/utils/layout";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export type TreeConfigState = {
  currentTree: Tree | null;
  nodes: AppNode[];
  edges: AppEdge[];
  filteredNodes: AppNode[];
  filteredEdges: AppEdge[];
  graphChanged: boolean;
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
        locations: string[];
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
  graphChanged: false,
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
          locations: [],
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
    setGraphChanged: (state, action: PayloadAction<boolean>) => {
      state.graphChanged = action.payload;
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

export const getFamilyTree = (
  state: TreeConfigState
): { nodeIds: string[]; edgeIds: string[] } => {
  const rootId = state.currentFilter.filterBy.rootPerson.person?.id;
  if (rootId === undefined) return { nodeIds: [], edgeIds: [] };
  const maxDepth = state.currentFilter.filterBy.rootPerson.onlyImmediate
    ? 1
    : Infinity;
  const visitedNodeIds = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: rootId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visitedNodeIds.has(id)) continue;
    visitedNodeIds.add(id);

    // Add spouse
    const spouseEdge = state.edges.find(
      (e) => e.type === Edges.MARRIED_TO && (e.source === id || e.target === id)
    );
    if (spouseEdge) {
      const spouseId =
        spouseEdge.source === id ? spouseEdge.target : spouseEdge.source;
      if (!visitedNodeIds.has(spouseId)) {
        queue.push({ id: spouseId, depth }); // same level
      }
    }

    // Add house
    const houseEdge = state.edges.find(
      (e) => e.type === Edges.BELONGS_TO && (e.source === id || e.target === id)
    );
    if (houseEdge) {
      const houseId =
        houseEdge.source === id ? houseEdge.target : houseEdge.source;
      visitedNodeIds.add(houseId);
    }

    // Add children (descendants)
    if (depth < maxDepth) {
      const childEdges = state.edges.filter(
        (e) => e.type === Edges.PARENT_OF && e.source === id
      );
      childEdges.forEach((e) => {
        queue.push({ id: e.target, depth: depth + 1 });
      });
    }
  }

  // Once all nodeIds are collected, add valid edges
  const visitedEdgeIds = new Set<string>();
  for (const edge of state.edges) {
    if (visitedNodeIds.has(edge.source) && visitedNodeIds.has(edge.target)) {
      visitedEdgeIds.add(edge.id);
    }
  }

  return {
    nodeIds: Array.from(visitedNodeIds),
    edgeIds: Array.from(visitedEdgeIds),
  };
};

const applyFilters = (state: TreeConfigState) => {
  const currentFilter = state.currentFilter;

  if (!currentFilter.enabled) {
    state.filteredNodes = state.nodes;
    state.filteredEdges = state.edges;
    return;
  }

  const familyTreeids = getFamilyTree(state);

  const nodes =
    familyTreeids.nodeIds.length > 0
      ? state.nodes.filter((node) => familyTreeids.nodeIds.includes(node.id))
      : state.nodes;
  const edges =
    familyTreeids.edgeIds.length > 0
      ? state.edges.filter((edge) => familyTreeids.edgeIds.includes(edge.id))
      : state.edges;

  if (!state.graphChanged) {
    const filterNodeIds = state.filteredNodes.map((node) => node.id);
    const filterEdgeIds = state.filteredEdges.map((edge) => edge.id);
    state.filteredEdges = edges.filter((edge) =>
      filterEdgeIds.includes(edge.id)
    );
    state.filteredNodes = nodes.filter((node) =>
      filterNodeIds.includes(node.id)
    );
    return;
  }

  const nodeIdsToRemove = [];

  /* Filter by nodeTypes */
  const nodeTypesSkipped: Nodes[] = [];
  if (!currentFilter.filterBy.nodeTypes.House)
    nodeTypesSkipped.push(Nodes.House);
  if (!currentFilter.filterBy.nodeTypes.Person)
    nodeTypesSkipped.push(Nodes.Person);
  if (nodeTypesSkipped.length > 0) {
    const localIdsToRemove = nodes
      .filter((node) => nodeTypesSkipped.includes(node.type as Nodes))
      .map((node) => node.id);
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

    nodeIdsToRemove.push(...localIdsToRemove);
  }

  if (personFilters.locations.length > 0) {
    const localIdsToRemove = nodes
      .filter(
        (node) =>
          node.type === Nodes.Person &&
          !personFilters.locations.includes(node.data.currLocation)
      )
      .map((node) => node.id);

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

  // Filter by edgeTypes
  const edgeTypesSkipped: Edges[] = [];
  if (!currentFilter.filterBy.edgeTypes.BELONGS_TO)
    edgeTypesSkipped.push(Edges.BELONGS_TO);
  if (!currentFilter.filterBy.edgeTypes.PARENT_OF)
    edgeTypesSkipped.push(Edges.PARENT_OF);
  if (!currentFilter.filterBy.edgeTypes.MARRIED_TO)
    edgeTypesSkipped.push(Edges.MARRIED_TO);
  if (edgeTypesSkipped.length > 0) {
    const localIdsToRemove = edges
      .filter((edge) => edgeTypesSkipped.includes(edge.type as Edges))
      .map((edge) => edge.id);
    edgeIdsToRemove.push(...localIdsToRemove);
  }
  const excludeEdgeIds = [...new Set(edgeIdsToRemove)];

  const fEdges = edges.filter((edge) => !excludeEdgeIds.includes(edge.id));
  const fNodes = nodes.filter((node) => !excludeNodeIds.includes(node.id));
  // const { nodes: filteredNodes, edges: filteredEdges } = getLayoutedElements(
  //   fNodes,
  //   fEdges // Use the processed edges
  // );
  state.filteredEdges = fEdges;
  state.filteredNodes = fNodes;
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
export const selectGraphChanged = (state: ParameterSetState) =>
  state.treeConfig.graphChanged;
export const selectAllLocations = (state: ParameterSetState) => {
  const allLocs = state.treeConfig.nodes
    .filter((node) => Boolean(node.data.currLocation))
    .map((node) => node.data.currLocation as string);
  return [...new Set(allLocs)].sort();
};

export const {
  setCurrentTree,
  setReduxNodes,
  setReduxEdges,
  setFilteredNodes,
  setFilteredEdges,
  setGraphChanged,
  setApplyFilters,
  setSelectedFilter,
  setSavedFilters,
  setCurrentFilter,
} = treeConfigSlice.actions;

export default treeConfigSlice.reducer;
