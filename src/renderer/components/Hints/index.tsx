import { APP_STATES } from '../../context/AppContext';
import { useAppContext } from '../../hooks/useAppContext';
import './styles.css';
const PHARESES: { [key: string]: string } = {
  [APP_STATES.PICKING_PERSON]: 'Выберите точку',
};

export const Hints = () => {
  const { appState } = useAppContext();

  const isTextExists = PHARESES[appState];

  if (!isTextExists) return;

  return <div className="hints-container">{isTextExists}</div>;
};
