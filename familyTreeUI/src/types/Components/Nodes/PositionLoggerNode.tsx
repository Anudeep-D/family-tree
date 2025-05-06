import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";

export type PositionLoggerNode = Node<{ label: string }, "position-logger">;

export function PositionLoggerNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<PositionLoggerNode>) {
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      <Handle id="a" type="target" position={Position.Top} />
      {data.label && <div>{data.label}</div>}

      <div>
        {x} {y}
      </div>

      <Handle id="b" type="source" position={Position.Bottom} />
    </div>
  );
}
