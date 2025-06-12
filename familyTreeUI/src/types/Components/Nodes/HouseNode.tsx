import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./HouseNode.scss";
import { NodeDataMap } from "@/types/nodeTypes";

export type HouseNode = Node<NodeDataMap["House"], "House">;

const HouseNode = ({ data }: NodeProps<HouseNode>) => {
  return (
    <div className="house-node">
      <strong>{data.name}</strong>
      <div className="sigil">{data.sigil}</div>
      <div className="words">"{data.words}"</div>
      <div className="hometown">🏡 {data.hometown}</div>
      <div className="gods">🙏 {data.gods}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default HouseNode;
