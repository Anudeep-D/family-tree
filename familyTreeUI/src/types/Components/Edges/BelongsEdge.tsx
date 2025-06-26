import {
  type Edge,
  getBezierPath,
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { EdgeDataMap, Edges } from "@/types/edgeTypes";
import "./RelationEdge.scss";
import { Chip, SvgIcon } from "@mui/material";
import BelongsIcon from "@/styles/svg/BelongsIcon";

export type BelongsEdgeType = Edge<
  EdgeDataMap[Edges.BELONGS_TO],
  Edges.BELONGS_TO
>; // Renamed to avoid conflict

const BelongsEdge = (props: EdgeProps<BelongsEdgeType>) => {
  // Use the new type name
  const {
    id, // id is in props, will be spread
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    markerStart,
    interactionWidth,
    // data, // data is used for the custom label via EdgeLabelRenderer, not directly by BaseEdge
    // selected, // Not a BaseEdge prop. Used by React Flow.
    // className, // Can be passed if needed: className={props.className}
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={interactionWidth}
        // className={props.className} // Example: if you need to pass it
      />
      <EdgeLabelRenderer>
        <div
          className={`edge-label ${Edges.BELONGS_TO.toLowerCase()}`}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            background: "#333",
            padding: "2px 6px",
            borderRadius: 4,
            color: "#fff",
            border: "1px solid #555",
          }}
        >
          <Chip
            icon={<SvgIcon component={BelongsIcon} inheritViewBox />}
            sx={{
              background: "#044d71a3",
            }}
            label="belongs to"
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default BelongsEdge;
