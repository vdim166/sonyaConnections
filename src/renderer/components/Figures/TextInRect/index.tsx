// @ts-ignore
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text, Circle, Image as KonvaImage } from 'react-konva';
import { figureType } from '../../../../main/classes/databaseManager';
import { appSignals } from '../../../classes/appSignals';
import { useAppContext } from '../../../hooks/useAppContext';

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

  const { selected, setSelected, setActionMenu, actionMenu } = useAppContext();

  const [cover, setCover] = useState<HTMLImageElement | null>(null);

  const groupRef = useRef<Konva.Group>(null);

  const prevStagePosRef = useRef({ x: 0, y: 0 });

  const rectWidth = 200;
  const rectHeight = 150;
  const textContent = options.name;

  useEffect(() => {
    const fetchCover = async () => {
      try {
        if (options.cover) {
          const cover = await appSignals.getFigureImage(options.cover);

          if (!cover) return;

          const img = new Image();
          img.src = `data:image/png;base64,${cover}`;

          img.onload = () => {
            setCover(img);
          };

          img.onerror = () => {
            console.warn('Не удалось декодировать base64 изображение');
            setCover(null);
          };

          // cleanup не обязателен, но хорошая практика
          return () => {
            img.onload = null;
            img.onerror = null;
          };
        } else {
          setCover(null);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchCover();
  }, [options]);

  // Anchor positions relative to the group
  const anchors = {
    top: { x: rectWidth / 2, y: 0 },
    bottom: { x: rectWidth / 2, y: rectHeight },
    left: { x: 0, y: rectHeight / 2 },
    right: { x: rectWidth, y: rectHeight / 2 },
  };

  const textFontSize = options.isBlock ? 30 : 25;

  useEffect(() => {
    // Center text
    const textNode = new Konva.Text({
      text: textContent,
      fontSize: textFontSize,
    });
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

  const handleGroupDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Your logic here, e.g., edit the group, select it, open a modal, etc.

    setSelected({ id: options.id, type: 'FIGURE' });

    // Optional: Access the group node
    // const group = e.target;

    // const rect = group.getClientRect(); // { x, y, width, height }

    // const topY = rect.y;

    // const X = rect.x + rect.width / 2;
    // console.log('topY', topY);
    // console.log('X', X);

    const group = groupRef.current as Konva.Group;
    const stage = group.getStage();

    if (!stage) return;

    // 1. Получаем абсолютные координаты группы относительно stage (с учётом детей, scale, rotation)
    const { x: groupX, y: groupY, width } = group.getClientRect();

    // 2. Получаем DOM-элемент контейнера stage (<div> от Konva)
    const container = stage.container(); // Это div с классом konvajs-content или твой container

    // 3. Получаем позицию этого div относительно окна браузера
    const containerRect = container.getBoundingClientRect();

    // 4. Итоговые координаты верхней границы группы относительно окна
    const screenTopY = containerRect.top + groupY;
    const screenLeftX = containerRect.left + groupX;

    setActionMenu({ x: screenLeftX + width / 2, y: screenTopY });
    // Prevent further bubbling if needed (e.g., to stage or layer)
    e.cancelBubble = true;
  };

  const rectOptions = options.isBlock
    ? {
        fill: 'rgba(25, 55, 105, 0.65)',
        cornerRadius: 10,
        stroke: 'rgba(147, 197, 253, 0.7)',
        strokeWidth: selected?.id === options.id ? 3.5 : 1.5,
        shadowColor: '#000000',
        shadowBlur: 20,
        shadowOffsetY: 8,
        shadowOpacity: 0.45,
      }
    : {
        fill: '#112d4e', // или #132f66
        cornerRadius: 8, // почти всегда смотрится лучше
        shadowColor: '#000000',
        shadowBlur: 12,
        shadowOffsetX: 0,
        shadowOffsetY: 6,
        shadowOpacity: 0.5,
        stroke: '#60a5fa',
        strokeWidth: selected?.id === options.id ? 4 : 2,
      };

  const textOptions = options.isBlock
    ? {
        fontSize: textFontSize,
        fill: '#e0f2fe',
        shadowColor: '#60a5fa',
        shadowBlur: 4,
        shadowOpacity: 0.6,
      }
    : {
        fontSize: textFontSize,
        fontFamily: 'system-ui, sans-serif',
        fill: '#b3e0ff',
        fontStyle: '500',
      };

  const anchorOptions = options.isBlock
    ? {
        radius: 6,
        fill: '#93c5fd',
        stroke: '#60a5fa',
        strokeWidth: 1.5,
        hitStrokeWidth: 10,
      }
    : {
        radius: 6,
        fill: '#60a5fa',
        stroke: '#3b82f6',
        strokeWidth: 1.5,
        hitStrokeWidth: 10,
      };

  return (
    <Group
      x={options.points.x}
      y={options.points.y}
      draggable={true}
      id={options.id}
      ref={groupRef}
      clasName="text-in-rect-group"
      onDragMove={(e) => {
        onDragMoveUpdate({ x: e.target.x(), y: e.target.y() });

        if (selected?.id !== options.id) return;
        if (!actionMenu) return;

        // Берём абсолютные экранные координаты группы
        const group = e.target as Konva.Group;
        const rect = group.getClientRect(); // ← вот это важно!

        const stage = group.getStage();
        if (!stage) return;

        const container = stage.container();
        const containerRect = container.getBoundingClientRect();

        const screenX = containerRect.left + rect.x + rect.width / 2;
        const screenY = containerRect.top + rect.y;

        setActionMenu({ x: screenX, y: screenY });
      }}
      onDragStart={(e) => {
        prevStagePosRef.current = e.target.position();
      }}
      onDragEnd={(e) => {
        updatePersonPosition(options.id, e.target.x(), e.target.y());
        onPositionChange({ x: e.target.x(), y: e.target.y() });
      }}
      onDblClick={handleGroupDoubleClick}
    >
      <Rect width={rectWidth} height={rectHeight} {...rectOptions} />
      {cover && (
        <KonvaImage
          image={cover}
          width={rectWidth}
          height={rectHeight}
          cornerRadius={rectOptions.cornerRadius}
          crop={(() => {
            const imgRatio = cover.width / cover.height;
            const containerRatio = rectWidth / rectHeight;

            let cropWidth, cropHeight, cropX, cropY;

            if (imgRatio > containerRatio) {
              // изображение шире → обрезаем по бокам
              cropHeight = cover.height;
              cropWidth = cropHeight * containerRatio;
              cropX = (cover.width - cropWidth) / 2;
              cropY = 0;
            } else {
              // изображение выше → обрезаем сверху/снизу
              cropWidth = cover.width;
              cropHeight = cropWidth / containerRatio;
              cropX = 0;
              cropY = (cover.height - cropHeight) / 2;
            }

            return {
              x: cropX,
              y: cropY,
              width: cropWidth,
              height: cropHeight,
            };
          })()}
        />
      )}

      {cover && (
        <Rect
          width={rectWidth}
          height={rectHeight}
          fill={
            options.isBlock
              ? 'rgba(17, 45, 78, 0.65)'
              : 'rgba(17, 45, 78, 0.55)'
          }
          cornerRadius={rectOptions.cornerRadius}
        />
      )}
      <Text x={textX} y={textY} text={textContent} {...textOptions} />
      {/* Add 4 anchors */}
      {Object.entries(anchors).map(([side, pos]) => (
        <Circle
          key={side}
          x={pos.x}
          y={pos.y}
          {...anchorOptions}
          onMouseDown={handleAnchorMouseDown(side as AnchorSide)}
        />
      ))}
    </Group>
  );
};
