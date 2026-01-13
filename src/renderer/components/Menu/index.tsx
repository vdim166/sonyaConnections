import { APP_STATES } from '../../context/AppContext';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { Block } from '../../icons/Block';
import { OpenDiary } from '../../icons/OpenDiary';
import { Person } from '../../icons/Person';
import './styles.css';

export const Menu = () => {
  const { appState, setAppState } = useAppContext();

  const { addModal } = useModalsManagerContext();

  return (
    <div className="action-menu">
      <button
        className={`action-button ${appState === APP_STATES.PICKING_BLOCK ? 'action-button-active' : ''}`}
        onClick={() => {
          if (appState === APP_STATES.PICKING_BLOCK) {
            setAppState(APP_STATES.IDLE);
            return;
          }

          setAppState(APP_STATES.PICKING_BLOCK);
        }}
      >
        <Block />
      </button>
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
      <button
        className="action-button"
        onClick={() => {
          addModal({
            type: MODALS_STATES.OPEN_DIARY,
            props: {
              id: null,
            },
          });
        }}
      >
        <OpenDiary />
      </button>
    </div>
  );
};
