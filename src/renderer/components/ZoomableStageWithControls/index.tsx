import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
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

type ZoomableStageWithControlsProps = {
  zoom: number;
};

type Connection = { startAnchorId: string; endAnchorId: string };

const throttle = (func: Function, limit: number) => {
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number | null = null;
  return (...args: any[]) => {
    if (lastRan === null) {
      func(...args);
      lastRan = Date.now();
    } else {
      if (lastFunc) clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan! >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan!),
      );
    }
  };
};

function ZoomableStageWithControls({ zoom }: ZoomableStageWithControlsProps) {
  const { addModal } = useModalsManagerContext();
  const { stageRef, appState, setAppState } = useAppContext();
  const [scale, setScale] = useState(zoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [persons, setPersons] = useState<figureType[] | null>(null);

  const scaleBy = 1.1;
  const minScale = 0.1;
  const maxScale = 5;

  useEffect(() => {
    if (!stageRef) return;
    const stage = stageRef.current;
    if (!stage) return;

    stage.scale({ x: zoom, y: zoom });
  }, [zoom]);

  const setZoom = async (newScale: number) => {
    await appSignals.setZoom(newScale);
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent, Node<NodeConfig>>) => {
    if (!stageRef) return;

    e.evt.preventDefault();
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

    // Ограничения масштаба
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    setScale(newScale);
    setZoom(newScale);
    setPosition(newPos);
    stage.batchDraw();
  };

  const zoomIn = () => {
    if (!stageRef) return;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    let newScale = oldScale * scaleBy;

    if (newScale > maxScale) return;

    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    setScale(newScale);
    setZoom(newScale);
    setPosition(newPos);
    stage.batchDraw();
  };

  const zoomOut = () => {
    if (!stageRef) return;
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    let newScale = oldScale / scaleBy;

    if (newScale < minScale) return;

    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    setScale(newScale);
    setZoom(newScale);
    setPosition(newPos);
    stage.batchDraw();
  };

  const resetZoom = () => {
    if (stageRef) {
      const stage = stageRef.current;
      if (!stage) return;

      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      setScale(1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      stage.batchDraw();
    }
  };

  const handleStageClick = (
    e: KonvaEventObject<MouseEvent, Node<NodeConfig>>,
  ) => {
    const stage = e.target.getStage();

    if (!stage) return;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    // Adjust pointer to content coordinates for accurate placement
    const contentX = (pointer.x - stage.x()) / stage.scaleX();
    const contentY = (pointer.y - stage.y()) / stage.scaleY();

    if (appState === APP_STATES.PICKING_PERSON) {
      const points = {
        x: contentX,
        y: contentY,
      };

      addModal({ type: MODALS_STATES.ADD_PERSON, props: { points } });
      setAppState(APP_STATES.IDLE);

      return;
    }
  };

  useEffect(() => {
    const getPersons = async () => {
      try {
        const persons = await appSignals.getPersons();

        setPersons(persons);
      } catch (error) {
        console.log('error', error);
      }
    };

    getPersons();

    window.addEventListener(FETCH_SIGNALS.FETCH_PERSONS, getPersons);

    return () => {
      window.removeEventListener(FETCH_SIGNALS.FETCH_PERSONS, getPersons);
    };
  }, []);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [tempLine, setTempLine] = useState<number[] | null>(null); // [x1, y1, x2, y2] for temp line
  const [renderKey, setRenderKey] = useState(0);

  const throttledSetRenderKey = useRef(
    throttle(() => setRenderKey((prev) => prev + 1), 16),
  ).current;

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
    if (persons) {
      for (let i = 0; i < persons.length; ++i) {
        const person = persons[i];

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
            person.id,
            sides[j],
            person.points.x + anchors[sides[j]].x,
            person.points.y + anchors[sides[j]].y,
          );
        }
      }
    }
  }, [persons]);

  const handlePositionChange = (
    id: string,
    newPoints: { x: number; y: number },
  ) => {
    setPersons(
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

    throttledSetRenderKey();
  };

  // In reality, call updateAnchorPosition after each block drag (use onDragEnd on Group)

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
    const handleMouseUp = () => {
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
        // Create persistent connection
        setConnections((prev) => [
          ...prev,
          {
            startAnchorId: anchorId || '',
            endAnchorId: targetAnchorId || '',
          },
        ]);
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

  return (
    <div>
      <div className="zoom-menu">
        <button onClick={zoomOut}>-</button>
        <span className="zoom-number-info">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn}>+</button>
        <button onClick={resetZoom} style={{ marginLeft: '10px' }}>
          Сброс
        </button>
        <span className="zoom-pos-info">
          Позиция: {Math.round(position.x)}, {Math.round(position.y)}
        </span>
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        draggable
        className={`${appState === APP_STATES.PICKING_PERSON ? 'picking' : ''}`}
        onClick={handleStageClick}
      >
        <Layer>
          {persons?.map((p) => {
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
          {connections.map((conn, index) => {
            const startPos = getAnchorPosition(conn.startAnchorId);
            const endPos = getAnchorPosition(conn.endAnchorId);
            if (!startPos || !endPos) return null;
            return (
              <Line
                key={index}
                points={[startPos.x, startPos.y, endPos.x, endPos.y]}
                stroke="#00796b"
                strokeWidth={2}
                dash={[5, 5]} // Optional: dashed for Miro-like
              />
            );
          })}

          {/* Render temporary line during connection */}
          {tempLine && (
            <Line
              points={tempLine}
              stroke="#00796b"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default ZoomableStageWithControls;
