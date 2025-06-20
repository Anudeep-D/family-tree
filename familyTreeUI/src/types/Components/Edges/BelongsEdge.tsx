import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import { EdgeDataMap, Edges } from "@/types/edgeTypes";
import './RelationEdge.scss';

export type BelongsEdgeType = Edge<EdgeDataMap[Edges.BELONGS_TO], Edges.BELONGS_TO>; // Renamed to avoid conflict

const BelongsEdge = (props: EdgeProps<BelongsEdgeType>) => { // Use the new type name
  const {
    id, // id is in props, will be spread
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data, // data is in props, used for label
    // markerEnd, style, className etc. are all in props
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Merge styles
  const mergedStyle = {
    stroke: 'var(--belongs-stroke-color)',
    strokeWidth: 'var(--belongs-stroke-width)',
    strokeDasharray: 'var(--belongs-stroke-dasharray)',
    ...(props.style || {}), // Spread props.style
  };

  // Merge className
  const customClassName = `edge-${Edges.BELONGS_TO.toLowerCase()}`;

  return (
    <>
      <BaseEdge
        {...props} // Spread all original props
        path={edgePath} // Override path
        style={mergedStyle} // Apply merged styles
        className={customClassName} // Apply merged class names
      />
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
          {Edges.BELONGS_TO} {/* Corrected: was [Edges.BELONGS_TO] */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default BelongsEdge;
