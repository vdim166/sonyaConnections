// @ts-ignore
import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { figureType } from '../../../../main/classes/databaseManager';
import { appSignals } from '../../../classes/appSignals';

type AnchorSide = 'top' | 'bottom' | 'left' | 'right';

type TextInRectProps = {
  options: figureType & { id: string }; // Assumes figureType has 'name' and 'points'
  onStartConnection: (anchorId: string, startX: number, startY: number) => void;
  onPositionChange: (newPoints: { x: number; y: number }) => void;
  onDragMoveUpdate: (tempPoints: { x: number; y: number }) => void;
};

export const TextInRect = ({
  options,
  onStartConnection,
  onPositionChange,
  onDragMoveUpdate,
}: TextInRectProps) => {
  const [textX, setTextX] = useState(0);
  const [textY, setTextY] = useState(0);

  const rectWidth = 200;
  const rectHeight = 150;
  const textContent = options.name;
  const anchorRadius = 6;
  const anchorFill = '#00796b';
  const anchorStroke = '#004d40';

  // Anchor positions relative to the group
  const anchors = {
    top: { x: rectWidth / 2, y: 0 },
    bottom: { x: rectWidth / 2, y: rectHeight },
    left: { x: 0, y: rectHeight / 2 },
    right: { x: rectWidth, y: rectHeight / 2 },
  };

  useEffect(() => {
    // Center text
    const textNode = new Konva.Text({ text: textContent, fontSize: 20 });
    const textWidth = textNode.width();
    const textHeight = textNode.height();

    setTextX((rectWidth - textWidth) / 2);
    setTextY((rectHeight - textHeight) / 2);
  }, [textContent]);

  // Handle mouse down on anchor to start connection
  const handleAnchorMouseDown =
    (side: AnchorSide) => (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true; // Prevent group drag
      const anchorNode = e.target as Konva.Circle;
      const group = anchorNode.parent as Konva.Group;
      const contentX = group.x() + anchorNode.x();
      const contentY = group.y() + anchorNode.y();
      const anchorId = `${options.id}-${side}`;
      onStartConnection(anchorId, contentX, contentY);
    };

  const updatePersonPosition = async (id: string, x: number, y: number) => {
    try {
      await appSignals.updatePersonPosition(id, x, y);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <Group
      x={options.points.x}
      y={options.points.y}
      draggable={true}
      onDragMove={(e) => {
        onDragMoveUpdate({ x: e.target.x(), y: e.target.y() });
      }}
      onDragEnd={(e) => {
        console.log('dxsadsaxx');
        updatePersonPosition(options.id, e.target.x(), e.target.y());

        onPositionChange({ x: e.target.x(), y: e.target.y() });
      }}
    >
      <Rect
        width={rectWidth}
        height={rectHeight}
        fill="#e0f7fa"
        stroke="#00796b"
        strokeWidth={1}
      />
      <Text
        x={textX}
        y={textY}
        text={textContent}
        fontSize={20}
        fontFamily="Arial"
        fill="#00796b"
      />
      {/* Add 4 anchors */}
      {Object.entries(anchors).map(([side, pos]) => (
        <Circle
          key={side}
          x={pos.x}
          y={pos.y}
          radius={anchorRadius}
          fill={anchorFill}
          stroke={anchorStroke}
          strokeWidth={1}
          onMouseDown={handleAnchorMouseDown(side as AnchorSide)}
          hitStrokeWidth={10} // Larger hit area for easier clicking
        />
      ))}
    </Group>
  );
};
