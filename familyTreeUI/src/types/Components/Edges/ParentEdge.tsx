import { type Edge, getBezierPath, type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import './RelationEdge.scss';
import { EdgeDataMap, Edges } from "@/types/edgeTypes";
import { Chip } from "@mui/material";

export type ParentEdgeType = Edge<EdgeDataMap[Edges.PARENT_OF], Edges.PARENT_OF>; // Renamed to avoid conflict with component name

const ParentEdge = (props: EdgeProps<ParentEdgeType>) => { // Use the new type name
  const {
    id,
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
          <Chip
            sx={{
              background: "#c19600a3",
            }}
            label={Edges.PARENT_OF}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ParentEdge;
