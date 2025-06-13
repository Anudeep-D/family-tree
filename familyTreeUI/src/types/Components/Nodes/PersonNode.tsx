import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
  return (
    <div className={`person-node ${data.isAlive ? "alive" : "deceased"}`}>
      <strong>{data.name}</strong>
      <div className="nickname">({data.nickName})</div>
      <div className="gender">{data.gender}</div>
      <div className={`character ${data.character}`}>{data.character}</div>

      <Handle id="l1" type="target" position={Position.Left} />
      <Handle id="r1" type="source" position={Position.Right} />
      <Handle id="t1" type="target" position={Position.Top} />
      <Handle id="b1"  type="source" position={Position.Bottom} />
    </div>
  );
};

export default PersonNode;
