import { appSignals } from '../../classes/appSignals';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { Delete } from '../../icons/Delete';
import { Diary } from '../../icons/Diary';
import './styles.css';

export const FigureActionMenu = () => {
  const { actionMenu, setActionMenu, selected, setSelected } = useAppContext();

  const { addModal } = useModalsManagerContext();

  if (actionMenu === null) return;

  const handleDeleteFigure = async () => {
    try {
      if (!selected) return;

      await appSignals.deleteFigure(selected.id);
      setActionMenu(null);
      setSelected(null);
      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleOpenDiary = () => {
    if (!selected) return;

    addModal({
      type: MODALS_STATES.OPEN_DIARY,
      props: {
        id: selected.id,
      },
    });
  };

  return (
    <div
      className="figure-action-menu"
      style={{
        top: actionMenu.y - 20,
        left: actionMenu.x,
      }}
    >
      <button className="action-menu-button" onClick={handleOpenDiary}>
        <Diary />
      </button>
      <button className="action-menu-button" onClick={handleDeleteFigure}>
        <Delete />
      </button>
    </div>
  );
};
