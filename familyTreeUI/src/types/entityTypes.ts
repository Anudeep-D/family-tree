export type User = {
  id?: string;
  elementId?: string;
  name?: string;
  email?: string;
  picture?: string;
  adminProjects?: any[];
  editorProjects?: any[];
  viewerProjects?: any[];
};


export type Project = {
  id?: string;
  elementId?: string;
  name: string;
  desc?: string;
  createdBy?: string;
  createdAt?: string;
  access?: string;
};
