// @ts-ignore
import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { figureType } from '../../../../main/classes/databaseManager';

type TextInRectProps = {
  options: figureType;
};

export const TextInRect = ({ options }: TextInRectProps) => {
  const [textX, setTextX] = useState(0);
  const [textY, setTextY] = useState(0);

  const rectWidth = 200;
  const rectHeight = 150;
  const textContent = options.name;

  useEffect(() => {
    // Вычисляем позицию текста по центру квадрата
    const textNode = new Konva.Text({ text: textContent, fontSize: 20 });
    const textWidth = textNode.width();
    const textHeight = textNode.height();

    setTextX((rectWidth - textWidth) / 2);
    setTextY((rectHeight - textHeight) / 2);
  }, [textContent]);

  return (
    <Group x={options.points.x} y={options.points.y} draggable={true}>
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
    </Group>
  );
};
