import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import { EdgeDataMap, Edges } from "@/types/edgeTypes";
import './RelationEdge.scss';

export type BelongsEdge = Edge<EdgeDataMap[Edges.BELONGS_TO], Edges.BELONGS_TO>;

const BelongsEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<BelongsEdge>) => {
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
      <BaseEdge id={id} path={edgePath} className={`edge-${Edges.BELONGS_TO.toLowerCase()}`} style={{ stroke: 'var(--belongs-stroke-color)', strokeWidth: 'var(--belongs-stroke-width)', strokeDasharray: 'var(--belongs-stroke-dasharray)' }} />
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

export default BelongsEdge;
