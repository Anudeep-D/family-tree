import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./HouseNode.scss";
import { NodeDataMap } from "@/types/nodeTypes";
import { useState } from "react"; // Import useState

export type HouseNode = Node<NodeDataMap["House"], "House">;

const HouseNode = ({ data }: NodeProps<HouseNode>) => {
  const [isHovered, setIsHovered] = useState(false); // Add isHovered state

  return (
    <div
      className="house-node"
      onMouseEnter={() => setIsHovered(true)} // Set isHovered to true on mouse enter
      onMouseLeave={() => setIsHovered(false)} // Set isHovered to false on mouse leave
    >
      <strong>{data.name}</strong>
      {isHovered && data.homeTown && ( // Conditionally render extra content
        <>
          <div className="hometown">🏡 {data.homeTown}</div>
        </>
      )}

      <Handle id="l1" type="target" position={Position.Left} />
      <Handle id="r1" type="source" position={Position.Right} />
      <Handle id="t1" type="target" position={Position.Top} />
      <Handle id="b1"  type="source" position={Position.Bottom} />
    </div>
  );
};

export default HouseNode;
