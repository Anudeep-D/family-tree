import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "./PersonNode.scss";
import { NodeDataMap, Nodes } from "@/types/nodeTypes";
import { useState, useEffect } from "react";
import dayjs from "dayjs"; // Keep for potential future use or if other parts rely on it
import { getImage } from "@/routes/common/imageStorage";
// Button import removed as it's no longer used for displayLabel

export type PersonNode = Node<NodeDataMap[Nodes.Person], Nodes.Person>;

const PersonNode = ({ data }: NodeProps<PersonNode>) => {
  const [imageUrlToDisplay, setImageUrlToDisplay] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (data.imageUrl) {
      const urlPromise = getImage(data.imageUrl);
      urlPromise
        .then((url) => setImageUrlToDisplay(url ?? undefined))
        .catch((e) => {
          console.error("Error creating URL for cache busting:", e);
          setImageUrlToDisplay(data.imageUrl); // Fallback to original URL on error
        });
    } else {
      setImageUrlToDisplay(undefined);
    }
  }, [data.imageUrl, data.updatedOn]); // Re-run if imageUrl or updatedOn changes

  const mainContent = (
    <div className="node-content">
      <div style={{ display: "flex", alignItems: "center" }}>
        <strong>{data.name}</strong>
      </div>
      {data.nickName && <div className="nickname">({data.nickName})</div>}
    </div>
  );

  const personNodeClasses = `person-node person-node-hoverable ${
    data.isAlive === "Yes" ? "alive" : "deceased"
  } ${imageUrlToDisplay ? "has-image" : ""}`;

  const displayLabel = data.nickName
    ? data.nickName.length > 16
      ? `${data.nickName.slice(0, 13)}...`
      : data.nickName
    : data.name.length > 16
    ? `${data.name.slice(0, 13)}...`
    : data.name;

  return (
    <div
      className={personNodeClasses}
      style={
        imageUrlToDisplay
          ? { backgroundImage: `url(${imageUrlToDisplay})` }
          : {}
      }
    >
      {imageUrlToDisplay ? (
        <div className="node-content">
          <div
            className="person-name-on-image"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Changed Button to a div for non-interactive text display */}
            <div
              className="person-name-on-image" // Keep class for potential specific styling
              style={{
                backgroundColor: "transparent",
                padding: 0,
                fontWeight: "bold",
                fontSize: "14px",
                textTransform: "none",
                fontFamily: "Impact, Charcoal, sans-serif",
                WebkitTextStroke: "0.5px #ffffff",
                color: "#111111",
                display: "inline-block", // To mimic button's text wrapping
              }}
            >
              {displayLabel}
            </div>
          </div>
        </div>
      ) : (
        mainContent
      )}
      <Handle id="married-left" type="target" position={Position.Left} />
      <Handle id="married-right" type="source" position={Position.Right} />
      <Handle id="child-of" type="target" position={Position.Top} />
      <Handle id="parent-of" type="source" position={Position.Bottom} />
    </div>
  );
};

export default PersonNode;
