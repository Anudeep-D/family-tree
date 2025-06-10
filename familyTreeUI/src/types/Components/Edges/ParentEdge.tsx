import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

export type ParentEdge = Edge<{ label: string }, "PARENT_OF">;
import './RelationEdge.scss';

const ParentEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<ParentEdge>) => {
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
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#999', strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <div
          className={`edge-label ${data?.label?.toLowerCase()}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            background: '#333',
            padding: '2px 6px',
            borderRadius: 4,
            color: '#fff',
            border: '1px solid #555',
          }}
        >
          {data?.label ?? 'NA'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ParentEdge;
