import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import { useState } from "react"; // Import useState

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
  const [isHovered, setIsHovered] = useState(false);
  const extraDetails = () => {
    return (
      <>
        <strong>{data.name}</strong>
        {data.nickName && <div className="nickname">({data.nickName})</div>}
        {data.gender && <div className="commonlook">{data.gender}</div>}
        {data.dob && (
          <div
            className={`commonlook green`}
          >{`DOB: ${data.dob.getDate()}`}</div>
        )}
        {data.doe && (
          <div className={`commonlook red`}>{`DOE: ${data.doe.getDate()}`}</div>
        )}
        {data.qualification && (
          <div className={`commonlook`}>{data.qualification}</div>
        )}
        {data.job && <div className={`commonlook`}>{data.job}</div>}
        {data.currLocation && (
          <div className={`commonlook`}>{data.currLocation}</div>
        )}
      </>
    );
  };
  if (data.imageUrl) {
    console.log("imageUrl", data.imageUrl);
    return (
      <div
        className={`person-node ${
          data.isAlive ? "alive" : "deceased"
        } has-image ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      >
        <div className="node-content">
          {!isHovered && (
            <strong className="person-name-on-image">{data.name}</strong>
          )}
          {isHovered && <div className="details-overlay">{extraDetails()}</div>}
        </div>
        <Handle id="l1" type="target" position={Position.Left} />
        <Handle id="r1" type="source" position={Position.Right} />
        <Handle id="t1" type="target" position={Position.Top} />
        <Handle id="b1" type="source" position={Position.Bottom} />
      </div>
    );
  } else {
    // Current rendering logic for no image
    return (
      <div
        className={`person-node ${data.isAlive ? "alive" : "deceased"} ${
          isHovered ? "hovered" : "" // Added hovered class for consistency if needed by SCSS later
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="node-content">
          {" "}
          {/* Added node-content wrapper for consistency */}
          {!isHovered && <strong>{data.name}</strong>}
          {data.nickName && !isHovered && (
            <div className="nickname">({data.nickName})</div>
          )}
          {isHovered && <>{extraDetails()}</>}
        </div>
        <Handle id="l1" type="target" position={Position.Left} />
        <Handle id="r1" type="source" position={Position.Right} />
        <Handle id="t1" type="target" position={Position.Top} />
        <Handle id="b1" type="source" position={Position.Bottom} />
      </div>
    );
  }
};

export default PersonNode;
