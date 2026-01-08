import { useAppContext } from '../../hooks/useAppContext';
import { Delete } from '../../icons/Delete';
import { Diary } from '../../icons/Diary';
import './styles.css';

export const FigureActionMenu = () => {
  const { actionMenu } = useAppContext();

  if (actionMenu === null) return;

  return (
    <div
      className="figure-action-menu"
      style={{
        top: actionMenu.y - 20,
        left: actionMenu.x,
      }}
    >
      <button className="action-menu-button">
        <Diary />
      </button>
      <button className="action-menu-button">
        <Delete />
      </button>
    </div>
  );
};
