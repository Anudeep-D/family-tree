// types/CustomEdgeTypes.ts
import { type Edge, getBezierPath, type EdgeProps } from "@xyflow/react";

export type LabeledEdge = Edge<{ label: string }, "labeled-edge">;
export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<LabeledEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  console.log(`Rendering edge ${id} from ${sourceX},${sourceY} to ${targetX},${targetY}`);
  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke="black"
        strokeWidth={2}
        fill="none"
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text
          x={labelX}
          y={labelY}
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="black"
        >
          {data.label}
        </text>
      )}
    </>
  );
}
