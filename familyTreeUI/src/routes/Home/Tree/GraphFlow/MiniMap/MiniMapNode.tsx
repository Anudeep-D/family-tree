import { Nodes } from "@/types/nodeTypes";
import { MiniMapNodeProps } from "@xyflow/react";

const MiniMapNode: React.FC<MiniMapNodeProps> = (props) => {
  const isPerson = props.className.toLowerCase() === Nodes.Person.toLowerCase();
  const isHouse = props.className.toLowerCase() === Nodes.House.toLowerCase();
  console.log(props);
  return isPerson ? (
    <circle
      cx={(props.width ?? 10) / 2}
      cy={(props.height ?? 10) / 2}
      r={(props.height ?? 10) / 2}
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth={1}
    />
  ) : (
    <rect
      x={0}
      y={0}
      width={props.width ?? 10}
      height={props.height ?? 10}
      rx={3}
      ry={3}
      fill="#42a5f5"
      stroke="#1565c0"
      strokeWidth={1}
    />
  );
};

export default MiniMapNode;
