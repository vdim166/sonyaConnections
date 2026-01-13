import { Line } from 'react-konva';
import { pointsType } from '../../../../main/types/pointsType';
import { connectionType } from '../../ZoomableStageWithControls';
// @ts-ignore
import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { useAppContext } from '../../../hooks/useAppContext';

type ConnectionProps = {
  getAnchorPosition: (anchorId: string) => pointsType | null;
  conn: connectionType;
};

export const Connection = ({ getAnchorPosition, conn }: ConnectionProps) => {
  const startPos = getAnchorPosition(conn.startAnchorId);
  const endPos = getAnchorPosition(conn.endAnchorId);

  const { selected, setSelected } = useAppContext();

  if (!startPos || !endPos) return null;

  const handleOnClick = (e: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    setSelected({ id: conn.id, type: 'CONNECTION' });
  };

  return (
    <Line
      key={conn.id}
      points={[startPos.x, startPos.y, endPos.x, endPos.y]}
      stroke="#00796b"
      strokeWidth={selected?.id === conn.id ? 5 : 2}
      dash={[5, 5]}
      onClick={handleOnClick}
      hitStrokeWidth={12}
      perfectDrawEnabled={false}
      listening={true}
    />
  );
};
