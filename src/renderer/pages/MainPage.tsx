import { useEffect, useState } from 'react';
import { Menu } from '../components/Menu';
import ZoomableStageWithControls from '../components/ZoomableStageWithControls';
import { appSignals } from '../classes/appSignals';
import { Hints } from '../components/Hints';

export const MainPage = () => {
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const getZoom = async () => {
      try {
        const zoom = await appSignals.getZoom();
        setZoom(zoom);
      } catch (error) {
        console.log('error', error);
      }
    };

    getZoom();
  }, []);

  if (zoom === null) return;

  return (
    <>
      <Menu />
      <Hints />
      <ZoomableStageWithControls zoom={zoom} />
    </>
  );
};
