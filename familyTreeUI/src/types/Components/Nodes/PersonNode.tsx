import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import { useState, useEffect } from "react"; // Import useEffect
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth(); // Get user object from useAuth

  const [imageUrlToDisplay, setImageUrlToDisplay] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (data.imageUrl) {
      try {
        const url = new URL(data.imageUrl);
        // Use user.id if available and non-empty, otherwise fallback to current time as a simple bust key.
        // This assumes `user` object is updated when auth state changes.
        const bustKey = user?.id ? user.id : new Date().getTime().toString();
        url.searchParams.set('v', bustKey);
        setImageUrlToDisplay(url.toString());
      } catch (e) {
        // If data.imageUrl is not a valid URL, use it as is.
        console.error("Error creating URL for cache busting:", e);
        setImageUrlToDisplay(data.imageUrl);
      }
    } else {
      setImageUrlToDisplay(undefined);
    }
  }, [data.imageUrl, user]); // Re-run if imageUrl or user changes

  const extraDetails = () => {
    return (
      <>
        <strong>{data.name}</strong>
        {data.nickName && <div className="nickname">({data.nickName})</div>}
        {data.gender && <div className="commonlook">{data.gender}</div>}
        {data.dob && (
          <div
            className={`commonlook green`}
          >{`DOB: ${dayjs(data.dob).format('DD-MMM-YYYY')}`}</div>
        )}
        {data.doe && (
          <div className={`commonlook red`}>{`DOE: ${dayjs(data.doe).format('DD-MMM-YYYY')}`}</div>
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

  // Use imageUrlToDisplay in rendering logic
  if (imageUrlToDisplay) { // Check imageUrlToDisplay instead of data.imageUrl directly
    console.log("imageUrlToDisplay", imageUrlToDisplay);
    return (
      <div
        className={`person-node ${
          data.isAlive ? "alive" : "deceased"
        } has-image ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ backgroundImage: `url(${imageUrlToDisplay})` }} // Use imageUrlToDisplay
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
    // Current rendering logic for no image (remains unchanged)
    return (
      <div
        className={`person-node ${data.isAlive ? "alive" : "deceased"} ${
          isHovered ? "hovered" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="node-content">
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
