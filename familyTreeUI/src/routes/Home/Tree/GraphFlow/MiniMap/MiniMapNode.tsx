import { Nodes } from "@/types/nodeTypes"; // Assuming Nodes enum is here
import { MiniMapNodeProps } from "@xyflow/react"; // Import Node for type safety if needed, MiniMapNodeProps is key

const MiniMapNode: React.FC<MiniMapNodeProps> = ({
  x,
  y,
  width,
  height,
  borderRadius,
  color,
  strokeColor,
  strokeWidth,
  shapeRendering,
  style,
  selected,
  className,
}) => {
  const type = className;
  const isPerson = type === Nodes.Person;
  const isHouse = type === Nodes.House;
  if (isHouse)
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        shapeRendering={shapeRendering}
        style={style}
        opacity={selected ? 1 : 0.8}
      />
    );
  if (isPerson)
    return (
      <circle
        r={Math.min(width, height) / 2}
        width={width}
        height={height}
        cx={x}
        cy={y}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        shapeRendering={shapeRendering}
        style={style}
        opacity={selected ? 1 : 0.8}
      />
    );

  return <></>;
};

export default MiniMapNode;
