import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import './RelationEdge.scss';
import { EdgeDataMap, Edges } from "@/types/edgeTypes";

export type ParentEdgeType = Edge<EdgeDataMap[Edges.PARENT_OF], Edges.PARENT_OF>; // Renamed to avoid conflict with component name

const ParentEdge = (props: EdgeProps<ParentEdgeType>) => { // Use the new type name
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

  return (
    <>
      <BaseEdge
        {...props} // Spread all original props
        path={edgePath} // Override path
      />
      <EdgeLabelRenderer>
        <div
          className={`edge-label ${Edges.PARENT_OF.toLowerCase()}`} // Corrected: was Edges.BELONGS_TO
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
          {Edges.PARENT_OF} {/* Corrected: was [Edges.PARENT_OF] */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ParentEdge;
