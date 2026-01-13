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
import { pointsType } from '../../../main/types/pointsType';
import { ZoomMenu } from '../ZoomMenu';
import { Connection } from '../Figures/Connection';
import { generateRandomId } from '../../../main/utils/generateRandomId';

export type connectionType = {
  startAnchorId: string;
  endAnchorId: string;
  id: string;
};

// const throttle = (func: Function, limit: number) => {
//   let lastFunc: NodeJS.Timeout | null = null;
//   let lastRan: number | null = null;
//   return (...args: any[]) => {
//     if (lastRan === null) {
//       func(...args);
//       lastRan = Date.now();
//     } else {
//       if (lastFunc) clearTimeout(lastFunc);
//       lastFunc = setTimeout(
//         () => {
//           if (Date.now() - lastRan! >= limit) {
//             func(...args);
//             lastRan = Date.now();
//           }
//         },
//         limit - (Date.now() - lastRan!),
//       );
//     }
//   };
// };

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

  const handleWheel = async (
    e: KonvaEventObject<WheelEvent, Node<NodeConfig>>,
  ) => {
    try {
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

      await appSignals.saveCanvasPosition(newPos);
    } catch (error) {
      console.log('error', error);
    }
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

          setConnections(connections);
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

  const handleDragEnd = async (
    e: KonvaEventObject<DragEvent, Node<NodeConfig>>,
  ) => {
    if (e.target !== e.currentTarget) return;

    try {
      const stage = e.target.getStage(); // Get the stage from the dragged node

      if (stage) {
        const newPos = e.target.position();

        await appSignals.saveCanvasPosition(newPos);
      }
    } catch (error) {
      console.log('error', error);
    }
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
        onDragEnd={handleDragEnd}
        draggable
        onDblClick={() => {
          setSelected(null);
          setActionMenu(null);
        }}
      >
        <Layer draggable>
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
          {connections.map((conn) => {
            return (
              <Connection
                key={conn.id}
                conn={conn}
                getAnchorPosition={getAnchorPosition}
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
