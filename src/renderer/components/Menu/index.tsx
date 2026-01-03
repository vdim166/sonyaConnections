import { APP_STATES } from '../../context/AppContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Person } from '../../icons/Person';
import './styles.css';

export const Menu = () => {
  const { appState, setAppState } = useAppContext();

  return (
    <div className="action-menu">
      <button
        className={`action-button ${appState === APP_STATES.PICKING_PERSON ? 'action-button-active' : ''}`}
        onClick={() => {
          if (appState === APP_STATES.PICKING_PERSON) {
            setAppState(APP_STATES.IDLE);
            return;
          }

          setAppState(APP_STATES.PICKING_PERSON);
        }}
      >
        <Person />
      </button>
      <button className="action-button">1</button>
    </div>
  );
};
