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

export type MarriageEdge = Edge<
  EdgeDataMap[Edges.MARRIED_TO],
  Edges.MARRIED_TO
>;
const MarriageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<MarriageEdge>) => {
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
        className={`edge-${Edges.MARRIED_TO.toLowerCase()}`}
        style={{
          stroke: "var(--marriage-stroke-color)",
          strokeWidth: "var(--marriage-stroke-width)",
        }}
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
          {data?.dateOfMarriage
            ? `married (${dayjs(data?.dateOfMarriage).format("DD-MMM-YYYY")})`
            : [Edges.MARRIED_TO]}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default MarriageEdge;
