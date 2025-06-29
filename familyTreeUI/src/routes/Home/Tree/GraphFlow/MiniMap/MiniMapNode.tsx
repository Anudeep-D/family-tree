import { Nodes } from '@/types/nodeTypes';
import { MiniMapNodeProps } from '@xyflow/react';

const MiniMapNode: React.FC<MiniMapNodeProps> = ({   width,
  height,
  color,
  strokeColor,
  strokeWidth,
  className,
  ...rest }) => {
  const isPerson = className.toLowerCase() === Nodes.Person.toLowerCase();
  const isHouse = className.toLowerCase() === Nodes.House.toLowerCase();
    console.log(className.toLowerCase(), Nodes.Person.toLowerCase());
  return isPerson ? (
    <circle
      cx={width / 2}
      cy={height / 2}
      r={height / 2}
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth={1}
    />
  ) : (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      rx={3}
      ry={3}
      fill="#42a5f5"
      stroke="#1565c0"
      strokeWidth={1}
    />
  )
};

export default MiniMapNode;