import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./HouseNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";

export type HouseNode = Node<NodeDataMap[Nodes.House], Nodes.House>;

const HouseNode = ({ data }: NodeProps<HouseNode>) => {
  return (
    <div className="house-node house-node-hoverable">
      <strong>{data.name}</strong>
      {/* Popover and InfoIcon removed, will be handled by onNodeClick in GraphFlow */}
      {/* data.homeTown can still be used by GraphFlow to decide if popover should show */}

      <Handle id="belongs-to" type="source" position={Position.Bottom} />
    </div>
  );
};

export default HouseNode;
