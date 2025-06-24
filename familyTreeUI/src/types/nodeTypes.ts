import type { NodeTypes, Position, XYPosition } from "@xyflow/react";
import PersonNode from "./Components/Nodes/PersonNode";
import HouseNode from "./Components/Nodes/HouseNode";
import { FromFieldList, FieldDef, FieldTypeMap } from "./common"; // Import FieldDef and FieldTypeMap

export enum Nodes {
  Person = "Person",
  House = "House",
}

// Definition for a single field in the metadata
// This type should be compatible with FieldDef for FromFieldList to work correctly.
export type NodeFieldDefinition = {
  readonly name: string;
  readonly label: string;
  readonly type: keyof FieldTypeMap | readonly string[]; // Aligns with FieldDef['type']
  readonly required: boolean;
  readonly default?: any; // Aligns with FieldDef['default']
  readonly isField: boolean;
  readonly subFields?: readonly NodeFieldDefinition[]; // subFields are also NodeFieldDefinitions (recursive)
                                                     // This also needs to be compatible with FieldDef's subFields.
                                                     // If FieldDef.subFields is readonly FieldDef[], then this should be too.
                                                     // Let's ensure NodeFieldDefinition itself is a valid FieldDef.
};

// Helper type to ensure NodeFieldDefinition is a valid FieldDef
type AssertNodeFieldDefIsFieldDef = NodeFieldDefinition extends FieldDef ? true : false;
const _assert: AssertNodeFieldDefIsFieldDef = true; // This will error if NodeFieldDefinition is not compatible with FieldDef


// This type can be used to ensure nodeFieldsMetadata conforms to a structure where each Node type maps to an array of NodeFieldDefinition.
// However, 'as const' provides stronger literal typing for 'type' and 'name' which is beneficial.
// NodeDialog.tsx will use NodeFieldDefinition to type the iterated 'field'.
export const nodeFieldsMetadata = {
  [Nodes.Person]: [
    {
      name: "name",
      type: "string",
      required: true,
      label: "Name",
      default: undefined,
      isField:true,
    },
    {
      name: "nickName",
      type: "string",
      required: false,
      label: "Nick name",
      default: undefined,
      isField:true,
    },
    {
      name: "gender",
      type: ["male", "female"],
      required: true,
      label: "Gender",
      default: "male",
      isField:true,
    },
    {
      name: "dob",
      type: "date",
      required: false,
      label: "Born on",
      default: undefined,
      isField:true,
    },
    {
      name: "currLocation",
      type: "string",
      required: false,
      label: "Current location",
      default: undefined,
      isField:true,
    },
    {
      name: "education",
      label: "Education Details",
      type: "educationObject",
      required: false,
      default: undefined,
      isField: true,
      subFields: [
        { name: "fieldOfStudy", label: "Field of Study", type: "string", required: false, isField: true },
        { name: "highestQualification", label: "Highest Qualification", type: "string", required: false, isField: true },
        { name: "institution", label: "Institution", type: "string", required: false, isField: true },
        { name: "location", label: "Location (Institution)", type: "string", required: false, isField: true }
      ]
    },
    {
      name: "job",
      label: "Job Details",
      type: "jobObject",
      required: false,
      default: undefined,
      isField: true,
      subFields: [
        { name: "jobType", label: "Job Type", type: "string", required: false, isField: true },
        { name: "employer", label: "Employer", type: "string", required: false, isField: true },
        { name: "jobTitle", label: "Job Title", type: "string", required: false, isField: true }
      ]
    },
    {
      name: "isAlive",
      type: ["Yes", "No"],
      required: false,
      label: "Is alive?",
      default: "Yes",
      isField:true,
    },
    {
      name: "doe",
      type: "date",
      required: false,
      label: "Died on",
      default: undefined,
      isField:true,
    },
    {
      name: "imageUrl",
      type: "string",
      required: false,
      label: "Image URL",
      default: undefined,
      isField:false,
    },
    {
      name: "imageUrl",
      type: "string",
      required: false,
      label: "Image URL",
      default: undefined,
      isField:false,
    },
    {
      name: "updatedOn",
      type: "date",
      required: false,
      label: "Updated On",
      default: undefined,
      isField:false,
    }
  ],
  [Nodes.House]: [
    {
      name: "name",
      type: "string",
      required: true,
      label: "Family name",
      default: undefined,
      isField:true,
    },
    {
      name: "homeTown",
      type: "string",
      required: false,
      label: "Origins of this family",
      default: undefined,
      isField:true,
    },
    {
      name: "updatedOn",
      type: "date",
      required: false,
      label: "Updated On",
      default: undefined,
      isField:false,
    }
  ],
} as const;


export type NodeDataMap = {
  [Nodes.Person]: FromFieldList<(typeof nodeFieldsMetadata)[Nodes.Person]>;
  [Nodes.House]: FromFieldList<(typeof nodeFieldsMetadata)[Nodes.House]>;
};

export const nodeTypes = {
  [Nodes.Person]: PersonNode,
  [Nodes.House]: HouseNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;

export type AppNode = {
  id: string;
  type: string;
  data: Record<string, any>;
  position: XYPosition; // optional
  sourcePosition?: Position;
  targetPosition?: Position;
};
