import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Group, Rect, Transformer } from 'react-konva';
import { TextInRect } from '../Figures/TextInRect';
import { useAppContext } from '../../hooks/useAppContext';
import './styles.css';
// @ts-ignore
import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { appSignals } from '../../classes/appSignals';
import { APP_STATES } from '../../context/AppContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { figureType } from '../../../main/classes/databaseManager';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';
import { pointsType } from '../../../main/types/pointsType';
import { ZoomMenu } from '../ZoomMenu';
import { Connection } from '../Figures/Connection';
import { generateRandomId } from '../../../main/utils/generateRandomId';

// @ts-ignore
import Konva from 'konva';

export type connectionType = {
  startAnchorId: string;
  endAnchorId: string;
  id: string;
};

function ZoomableStageWithControls() {
  const { addModal } = useModalsManagerContext();
  const {
    stageRef,
    appState,
    setAppState,
    scale,
    selected,
    setScale,
    setPosition,
    setSelected,
    setActionMenu,
    actionMenu,
  } = useAppContext();

  const [figures, setFigures] = useState<figureType[] | null>(null);

  const scaleBy = 1.1;
  const minScale = 0.1;
  const maxScale = 5;

  useEffect(() => {
    const handle = async (e: KeyboardEvent) => {
      if (selected === null) return;

      if (e.key === 'Delete') {
        if (selected.type === 'FIGURE') {
          await appSignals.deleteFigure(selected.id);
        } else if (selected.type === 'CONNECTION') {
          await appSignals.deleteConnection(selected.id);
        }
        window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
        setActionMenu(null);
        setSelected(null);
      }
    };

    window.addEventListener('keydown', handle);

    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, [selected]);

  useEffect(() => {
    const getCanvasPosition = async () => {
      try {
        const pos: pointsType | undefined =
          await appSignals.getCanvasPosition();

        if (pos && stageRef && stageRef.current) {
          stageRef.current.position(pos);

          setPosition(pos);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    getCanvasPosition();
  }, []);

  useEffect(() => {
    if (!stageRef) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (scale) stage.scale({ x: scale, y: scale });
  }, [scale]);

  const setZoom = async (newScale: number) => {
    await appSignals.setZoom(newScale);
  };

  const handleWheel = async (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    if (!stageRef) return;

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);

    // ← Вот это важно — пересчитываем экранные координаты меню
    if (actionMenu && selected?.id) {
      // Предполагаем, что actionMenu привязано к фигуре
      // Нужно знать, к какой именно фигуре оно открыто

      const figure = stage.findOne(`#${selected.id}`); // или другой способ найти группу

      if (figure) {
        const rect = figure.getClientRect();
        const container = stage.container();
        const containerRect = container.getBoundingClientRect();

        const newScreenX = containerRect.left + rect.x + rect.width / 2;
        const newScreenY = containerRect.top + rect.y;

        setActionMenu({ x: newScreenX, y: newScreenY });
      }
    }

    setScale(newScale);
    setZoom(newScale);
    setPosition(newPos);
    stage.batchDraw();

    await appSignals.saveCanvasPosition(newPos);
  };

  const handleStageClick = (
    e: KonvaEventObject<MouseEvent, Node<NodeConfig>>,
  ) => {
    const stage = e.target.getStage();

    if (!stage) return;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const contentX = (pointer.x - stage.x()) / stage.scaleX();
    const contentY = (pointer.y - stage.y()) / stage.scaleY();

    if (appState === APP_STATES.PICKING_PERSON) {
      const points = {
        x: contentX,
        y: contentY,
      };

      addModal({
        type: MODALS_STATES.ADD_PERSON,
        props: { points, isBlock: false },
      });
      setAppState(APP_STATES.IDLE);

      return;
    } else if (appState === APP_STATES.PICKING_BLOCK) {
      const points = {
        x: contentX,
        y: contentY,
      };

      addModal({
        type: MODALS_STATES.ADD_BLOCK,
        props: { points, isBlock: true },
      });
      setAppState(APP_STATES.IDLE);

      return;
    }
  };

  useEffect(() => {
    const getFigures = async () => {
      try {
        const persons = await appSignals.getFigures();

        setFigures(persons);
      } catch (error) {
        console.log('error', error);
      }
    };

    getFigures();

    window.addEventListener(FETCH_SIGNALS.FETCH_FIGURES, getFigures);

    return () => {
      window.removeEventListener(FETCH_SIGNALS.FETCH_FIGURES, getFigures);
    };
  }, []);

  const [connections, setConnections] = useState<connectionType[]>([]);

  const [tempLine, setTempLine] = useState<number[] | null>(null); // [x1, y1, x2, y2] for temp line
  // const [renderKey, setRenderKey] = useState(0);

  // const throttledSetRenderKey = useRef(
  //   throttle(() => setRenderKey((prev) => prev + 1), 16),
  // ).current;

  // Map to store absolute positions of all anchors (update on drag end or render)
  const anchorPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  // Function to update anchor positions (call on mount or after drag)
  const updateAnchorPosition = (
    blockId: string,
    side: string,
    x: number,
    y: number,
  ) => {
    const anchorId = `${blockId}-${side}`;
    anchorPositions.current.set(anchorId, { x, y });
  };

  useEffect(() => {
    if (figures) {
      for (let i = 0; i < figures.length; ++i) {
        const figure = figures[i];

        const sides = ['top', 'bottom', 'left', 'right'];

        const rectWidth = 200;
        const rectHeight = 150;
        const anchors: { [key: string]: { x: number; y: number } } = {
          top: { x: rectWidth / 2, y: 0 },
          bottom: { x: rectWidth / 2, y: rectHeight },
          left: { x: 0, y: rectHeight / 2 },
          right: { x: rectWidth, y: rectHeight / 2 },
        };

        for (let j = 0; j < sides.length; ++j) {
          updateAnchorPosition(
            figure.id,
            sides[j],
            figure.points.x + anchors[sides[j]].x,
            figure.points.y + anchors[sides[j]].y,
          );
        }
      }

      const fetchConnections = async () => {
        try {
          const connections = await appSignals.getConnections();

          setConnections(connections || []);
        } catch (error) {
          console.log('error', error);
        }
      };

      fetchConnections();
    }
  }, [figures]);

  const handlePositionChange = (
    id: string,
    newPoints: { x: number; y: number },
  ) => {
    setFigures(
      (prev) =>
        prev?.map((p) => (p.id === id ? { ...p, points: newPoints } : p)) ||
        null,
    );
  };

  const handleDragMoveUpdate = (
    id: string,
    tempPoints: { x: number; y: number },
  ) => {
    const rectWidth = 200;
    const rectHeight = 150;
    const anchors: { [key: string]: { x: number; y: number } } = {
      top: { x: rectWidth / 2, y: 0 },
      bottom: { x: rectWidth / 2, y: rectHeight },
      left: { x: 0, y: rectHeight / 2 },
      right: { x: rectWidth, y: rectHeight / 2 },
    };
    const sides = ['top', 'bottom', 'left', 'right'];

    sides.forEach((side) => {
      const rel = anchors[side];
      updateAnchorPosition(
        id,
        side,
        tempPoints.x + rel.x,
        tempPoints.y + rel.y,
      );
    });

    // throttledSetRenderKey();
  };

  const onStartConnection = (
    anchorId: string,
    startX: number,
    startY: number,
  ) => {
    if (!stageRef) return;
    setTempLine([startX, startY, startX, startY]); // Start temp line at anchor

    const stage = stageRef.current;
    if (!stage) return;

    // Add mouse move listener for temp line
    const handleMouseMove = () => {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const contentPointerX = (pointer.x - stage.x()) / stage.scaleX();
      const contentPointerY = (pointer.y - stage.y()) / stage.scaleY();

      setTempLine([startX, startY, contentPointerX, contentPointerY]);
    };

    // Add mouse up listener to end connection
    const handleMouseUp = async () => {
      const pointer = stage.getPointerPosition();
      if (!pointer) {
        // Clean up
        setTempLine(null);
        stage.off('mousemove', handleMouseMove);
        stage.off('mouseup', handleMouseUp);
        return;
      }

      const contentPointerX = (pointer.x - stage.x()) / stage.scaleX();
      const contentPointerY = (pointer.y - stage.y()) / stage.scaleY();

      // Check if over another anchor (iterate map to find closest within threshold)
      let targetAnchorId: string | null = null;
      const threshold = 10 / stage.scaleX(); // Adjust threshold for zoom level
      anchorPositions.current.forEach((pos, id) => {
        if (
          id !== anchorId &&
          Math.hypot(pos.x - contentPointerX, pos.y - contentPointerY) <
            threshold
        ) {
          targetAnchorId = id;
        }
      });

      if (targetAnchorId) {
        try {
          const newConnection = {
            startAnchorId: anchorId || '',
            endAnchorId: targetAnchorId || '',
            id: generateRandomId(),
          };

          // Create persistent connection
          setConnections((prev) => [...prev, newConnection]);

          await appSignals.addConnection(newConnection);
        } catch (error) {
          console.log('error', error);
        }
      }

      // Clean up
      setTempLine(null);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };

    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
  };

  const getAnchorPosition = (anchorId: string) =>
    anchorPositions.current.get(anchorId) || null;

  const prevStagePosRef = useRef({ x: 0, y: 0 });

  const transformerRef = useRef<any>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);

  const handleMiddleMouseDown = (
    e: KonvaEventObject<MouseEvent, Node<NodeConfig>>,
  ) => {
    if (!stageRef) return;
    const evt = e.evt;

    if (evt.button === 1) {
      // Средняя кнопка мыши
      evt.preventDefault();

      setIsPanning(true);
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();

      if (pos) setPanStartPos(pos);
      setStagePosition(stage.position());
    }
  };

  const handleMiddleMouseMove = (
    e: KonvaEventObject<MouseEvent, Node<NodeConfig>>,
  ) => {
    if (!stageRef) return;

    if (!isPanning || !stageRef.current) return;

    const stage = stageRef.current;
    const currentPos = stage.getPointerPosition();

    if (!currentPos) return;

    const deltaX = currentPos.x - panStartPos.x;
    const deltaY = currentPos.y - panStartPos.y;

    const newPosition = {
      x: stagePosition.x + deltaX,
      y: stagePosition.y + deltaY,
    };

    if (actionMenu && selected) {
      const group = stage.findOne(`#${selected.id}`);
      if (!group) return;
      const rect = group.getClientRect(); // ← вот это важно!

      if (!stage) return;

      const container = stage.container();
      const containerRect = container.getBoundingClientRect();

      const screenX = containerRect.left + rect.x + rect.width / 2;
      const screenY = containerRect.top + rect.y;

      setActionMenu({ x: screenX, y: screenY });
    }
    stage.position(newPosition);
    stage.batchDraw();
  };

  const handleMiddleMouseUp = async (
    e: KonvaEventObject<MouseEvent, Node<NodeConfig>>,
  ) => {
    const evt = e.evt;

    if (evt.button === 1) {
      setIsPanning(false);

      if (stageRef && stageRef.current) {
        const newPos = stageRef.current.position();
        await appSignals.saveCanvasPosition(newPos);
        setStagePosition(newPos);
      }
    }
  };

  // ============ ОБРАБОТЧИКИ ЛЕВОЙ КНОПКИ (ВЫДЕЛЕНИЕ) ============
  const handleLeftMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    // Кликнули по пустому месту без модификаторов → начинаем выделение
    if (e.target === e.target.getStage() && !e.evt.ctrlKey && !e.evt.shiftKey) {
      const stage = e.target.getStage()!;
      const pointer = stage.getPointerPosition()!;

      // Мировые координаты начала выделения
      const startWorld = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      };

      setSelectionRect({
        startX: startWorld.x,
        startY: startWorld.y,
        endX: startWorld.x,
        endY: startWorld.y,
      });

      setIsSelecting(true);
      setSelectedShapes([]); // сбрасываем текущее выделение
    }
  };

  const handleLeftMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!stageRef) return;
    if (!isSelecting) return;

    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition()!;

    const currentWorld = {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };

    setSelectionRect((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        endX: currentWorld.x,
        endY: currentWorld.y,
      };
    });
  };

  const handleLeftMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (!selectionRect) return;

    const { startX, startY, endX, endY } = selectionRect;

    // Нормализуем прямоугольник (start может быть правее/ниже end)
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const selectedIds: string[] = [];

    figures?.forEach((fig) => {
      const figX = fig.points.x;
      const figY = fig.points.y;
      const figW = 200; // ширина прямоугольника
      const figH = 150;

      // Простейшая проверка пересечения двух прямоугольников
      if (
        figX < maxX &&
        figX + figW > minX &&
        figY < maxY &&
        figY + figH > minY
      ) {
        selectedIds.push(fig.id);
      }
    });

    setSelectedShapes(selectedIds);

    // Можно сразу применить transformer к выбранным группам
    if (stageRef && selectedIds.length > 0 && transformerRef.current) {
      const nodes = selectedIds
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Group[];

      transformerRef.current.nodes(nodes);
    } else {
      transformerRef.current?.nodes([]);
    }

    // Чистим прямоугольник выделения
    setSelectionRect(null);
  };

  return (
    <div>
      <ZoomMenu scaleBy={scaleBy} maxScale={maxScale} minScale={minScale} />

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        id="stage-container"
        className={`${appState === APP_STATES.PICKING_PERSON || appState === APP_STATES.PICKING_BLOCK ? 'picking' : ''}`}
        onClick={handleStageClick}
        // onDragEnd={handleDragEnd}
        onDblClick={() => {
          setSelected(null);
          setActionMenu(null);
        }}
        onDragStart={(e) => {
          prevStagePosRef.current = e.target.position();
        }}
        onDragMove={(e) => {
          if (e.target !== e.currentTarget) return;
          if (!actionMenu) return;

          const currentPos = e.target.position();
          const prevPos = prevStagePosRef.current;

          const deltaX = prevPos.x - currentPos.x;
          const deltaY = prevPos.y - currentPos.y;

          setActionMenu((prev) => {
            if (!prev) return null;

            return {
              x: prev.x - deltaX,
              y: prev.y - deltaY,
            };
          });

          // Очень важно! Обновляем предыдущую позицию
          prevStagePosRef.current = currentPos;
        }}
        onMouseDown={(e) => {
          const evt = e.evt;
          if (evt.button === 1) handleMiddleMouseDown(e);
          if (evt.button === 0) handleLeftMouseDown(e);
        }}
        onMouseMove={(e) => {
          if (isPanning) handleMiddleMouseMove(e);
          if (isSelecting) handleLeftMouseMove(e);
        }}
        onMouseUp={(e) => {
          const evt = e.evt;
          if (evt.button === 1) handleMiddleMouseUp(e);
          if (evt.button === 0) handleLeftMouseUp();
        }}
        onMouseLeave={() => {
          if (isPanning) {
            setIsPanning(false);
            if (stageRef && stageRef.current) {
            }
          }
          if (isSelecting) {
            setIsSelecting(false);
            setSelectionRect(null);
          }
        }}
      >
        <Layer>
          {selectionRect && (
            <Rect
              x={Math.min(selectionRect.startX, selectionRect.endX)}
              y={Math.min(selectionRect.startY, selectionRect.endY)}
              width={Math.abs(selectionRect.endX - selectionRect.startX)}
              height={Math.abs(selectionRect.endY - selectionRect.startY)}
              fill="rgba(0, 120, 255, 0.12)"
              stroke="rgb(0, 140, 255)"
              strokeWidth={1.5}
              dash={[6, 4]}
            />
          )}
          {connections.map((conn) => {
            return (
              <Connection
                key={conn.id}
                conn={conn}
                getAnchorPosition={getAnchorPosition}
              />
            );
          })}
          {figures?.map((p) => {
            return (
              <TextInRect
                key={p.name}
                onStartConnection={onStartConnection}
                options={{ ...p }}
                onPositionChange={(newPoints) =>
                  handlePositionChange(p.id, newPoints)
                }
                onDragMoveUpdate={(tempPoints) =>
                  handleDragMoveUpdate(p.id, tempPoints)
                }
              />
            );
          })}
          {tempLine && (
            <Line
              points={tempLine}
              stroke="#00796b"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            anchorSize={10}
            borderStroke="blue"
            borderStrokeWidth={1}
            anchorStroke="blue"
            anchorFill="white"
            rotateEnabled={true}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default ZoomableStageWithControls;
