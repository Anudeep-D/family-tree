import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import './RelationEdge.scss';
import { EdgeDataMap, Edges } from "@/types/edgeTypes";

export type ParentEdge = Edge<EdgeDataMap[Edges.PARENT_OF], Edges.PARENT_OF>;
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
      <BaseEdge id={id} path={edgePath} className="edge-parent" style={{ stroke: 'var(--parent-stroke-color)', strokeWidth: 'var(--parent-stroke-width)', strokeDasharray: 'var(--parent-stroke-dasharray)' }} />
      <EdgeLabelRenderer>
        <div
          className={`edge-label ${Edges.BELONGS_TO.toLowerCase()}`}
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
          {[Edges.BELONGS_TO]}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ParentEdge;
