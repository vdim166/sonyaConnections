import { appSignals } from '../../classes/appSignals';
import { useAppContext } from '../../hooks/useAppContext';
import './styles.css';

type ZoomMenuProps = {
  scaleBy: number;
  maxScale: number;
  minScale: number;
};

export const ZoomMenu = ({ scaleBy, maxScale, minScale }: ZoomMenuProps) => {
  const { stageRef, scale, setScale, setPosition } = useAppContext();

  const setZoom = async (newScale: number) => {
    await appSignals.setZoom(newScale);
  };

  const zoomIn = async () => {
    try {
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

      await appSignals.saveCanvasPosition(newPos);
    } catch (error) {
      console.log('error', error);
    }
  };

  const zoomOut = async () => {
    try {
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

      await appSignals.saveCanvasPosition(newPos);
    } catch (error) {
      console.log('error', error);
    }
  };

  const resetZoom = async () => {
    try {
      if (stageRef) {
        const stage = stageRef.current;
        if (!stage) return;

        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        setScale(1);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        stage.batchDraw();

        await appSignals.saveCanvasPosition({ x: 0, y: 0 });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="zoom-menu">
      <button className="zoom-man-button" onClick={zoomOut}>
        -
      </button>
      <span className="zoom-number-info">
        {Math.round((scale || 1) * 100)}%
      </span>
      <button className="zoom-man-button" onClick={zoomIn}>
        +
      </button>
      <button
        className="zoom-reset"
        onClick={resetZoom}
        style={{ marginLeft: '10px' }}
      >
        Сброс
      </button>
    </div>
  );
};
