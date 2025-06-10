import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import './HouseNode.scss';

export type HouseNode = Node<
  {
    name: string;
    sigil: string;
    words: string;
    nickName: string;
    hometown: string;
    gods: string;
  },
  "House"
>;

const HouseNode= ({ data }: NodeProps<HouseNode>) => {
  return (
    <div className="house-node">
      <strong>{data.name}</strong>
      <div className="sigil">{data.sigil}</div>
      <div className="words">"{data.words}"</div>
      <div className="hometown">🏡 {data.hometown}</div>
      <div className="gods">🙏 {data.gods}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default HouseNode;
