export type User = {
  id?: string;
  elementId?: string;
  name?: string;
  email?: string;
  picture?: string;
  adminTrees?: any[];
  editorTrees?: any[];
  viewerTrees?: any[];
};


export type Tree = { // Renamed from Tree
  id?: string;
  elementId?: string;
  name: string;
  desc?: string;
  createdBy?: string;
  createdAt?: string;
  access?: string;
};
