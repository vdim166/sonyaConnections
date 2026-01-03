import { useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
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

function ZoomableStageWithControls({ zoom }: ZoomableStageWithControlsProps) {
  const { addModal } = useModalsManagerContext();
  const { stageRef, appState, setAppState } = useAppContext();
  const [scale, setScale] = useState(zoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [persons, setPersons] = useState<figureType[] | null>(null);

  const scaleBy = 1.1;
  const minScale = 0.1;
  const maxScale = 5;

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
    const pos = stage.getPointerPosition();

    if (!pos) return;

    if (appState === APP_STATES.PICKING_PERSON) {
      const points = {
        x: pos.x,
        y: pos.y,
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
            return <TextInRect options={p} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default ZoomableStageWithControls;
