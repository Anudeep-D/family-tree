import {
  type Edge,
  getBezierPath,
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
} from "@xyflow/react";

import "./RelationEdge.scss";
import { EdgeDataMap, Edges } from "@/types/edgeTypes";
import dayjs from "dayjs";
import { Chip, SvgIcon } from "@mui/material";
import MarriageIcon from "@styles/svg/MarriageIcon";
export type MarriageEdgeType = Edge<
  EdgeDataMap[Edges.MARRIED_TO],
  Edges.MARRIED_TO
>;
const MarriageEdge = (props: EdgeProps<MarriageEdgeType>) => {
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
    data, // data is used for the custom label via EdgeLabelRenderer, not directly by BaseEdge
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
          className={`edge-label ${Edges.MARRIED_TO.toLowerCase()}`}
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
            sx={{
              background: "#7a4206a3",
            }}
            icon={<SvgIcon component={MarriageIcon} inheritViewBox />}
            label={
              data?.dateOfMarriage
                ? dayjs(data?.dateOfMarriage).format("DD-MMM-YYYY")
                : Edges.MARRIED_TO
            }
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default MarriageEdge;
