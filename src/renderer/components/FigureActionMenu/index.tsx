import { useEffect, useRef, useState } from 'react';
import { appSignals } from '../../classes/appSignals';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useAppContext } from '../../hooks/useAppContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { Delete } from '../../icons/Delete';
import { Diary } from '../../icons/Diary';
import './styles.css';
import { figureType } from '../../../main/classes/databaseManager';
import { AddImage } from '../../icons/AddImage';
import { DeleteImage } from '../../icons/DeleteImage';

export const FigureActionMenu = () => {
  const { actionMenu, setActionMenu, selected, setSelected } = useAppContext();

  const { addModal } = useModalsManagerContext();

  const [selectedFigure, setSelectedFigure] = useState<figureType | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSelected = async () => {
      // selected.type

      if (selected) {
        const figure = await appSignals.getFigure(selected.id);

        try {
          if (figure) {
            if (figure.isBlock) {
              setSelectedFigure(figure);
            } else {
              setSelectedFigure(null);
            }
          } else {
            setSelectedFigure(null);
          }
        } catch (error) {
          console.log('error', error);
        }
      } else {
        setSelectedFigure(null);
      }
    };

    fetchSelected();
  }, [selected]);

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

  const handleImageFile = async (file: File) => {
    try {
      if (!selected) return;

      const arrayBuffer = await file.arrayBuffer();

      const uint8Array = new Uint8Array(arrayBuffer);

      const newSelected = await appSignals.addCoverForFigure(
        selected.id,
        uint8Array,
      );

      setSelected(newSelected);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  const deleteCoverHandle = async () => {
    try {
      if (!selected) return;
      const newSelected = await appSignals.deleteCoverForFigure(selected.id);

      setSelected(newSelected);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div
      className="figure-action-menu"
      style={{
        top: actionMenu.y - 20,
        left: actionMenu.x,
      }}
    >
      {selectedFigure && (
        <button
          className="action-menu-button"
          onClick={() => {
            imageInputRef.current?.click();
          }}
        >
          <AddImage />

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={imageInputRef}
            onChange={async (event) => {
              const files = event.target.files;
              if (files && files.length > 0) {
                await handleImageFile(files[0]);

                if (imageInputRef.current) {
                  imageInputRef.current.value = '';
                }
              }
            }}
          />
        </button>
      )}

      {selectedFigure?.cover && (
        <button className="action-menu-button" onClick={deleteCoverHandle}>
          <DeleteImage />
        </button>
      )}
      <button className="action-menu-button" onClick={handleOpenDiary}>
        <Diary />
      </button>
      <button className="action-menu-button" onClick={handleDeleteFigure}>
        <Delete />
      </button>
    </div>
  );
};
