import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";

export type PersonNode = Node<
  {
    name: string;
    label: string;
    isAlive: string;
    nickName: string;
    gender: string;
    character: string;
  },
  "Person"
>;

const PersonNode= ({ data }: NodeProps<PersonNode>) => {
  return (
    <div className={`person-node ${data.isAlive ? "alive" : "deceased"}`}>
      <strong>{data.name}</strong>
      <div className="nickname">({data.nickName})</div>
      <div className="gender">{data.gender}</div>
      <div className={`character ${data.character}`}>{data.character}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default PersonNode;
