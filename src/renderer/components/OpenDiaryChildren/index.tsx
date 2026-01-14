import { useEffect, useState } from 'react';
import { figureType } from '../../../main/classes/databaseManager';
import './styles.css';
import { ArrowDown } from '../../icons/ArrowDown';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { extendedFigureType } from '../modals/OpenDiaryModal';

type OpenDiaryChildren = {
  c: extendedFigureType;
  blockConnections: {
    [key: string]: extendedFigureType[];
  };
};

export const OpenDiaryChildren = ({
  c,
  blockConnections,
}: OpenDiaryChildren) => {
  const [isClicked, setIsClicked] = useState(c.isOpenByDefault);
  const [children, setChildren] = useState<extendedFigureType[]>([]);

  const { currentDiary, setCurrentDiary } = useDiaryContext();

  useEffect(() => {
    if (isClicked) {
      if (blockConnections[c.id]) {
        setChildren(blockConnections[c.id]);
      }
    } else {
      setChildren([]);
    }
  }, [isClicked, c, blockConnections]);

  return (
    <div className="open-diary-modal-children-wrapper">
      <div
        className="open-diary-modal-children-container"
        onClick={() => {
          setCurrentDiary(c);
        }}
      >
        <div
          className={`open-diary-modal-children ${currentDiary?.id === c.id ? 'open-diary-modal-children-active' : ' '}`}
        >
          {c.name}
        </div>
        {blockConnections[c.id] && (
          <div
            className={`open-diary-modal-children-arrow-down ${isClicked ? 'open-diary-modal-children-arrow-down-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsClicked((prev) => !prev);
            }}
          >
            <ArrowDown />
          </div>
        )}
      </div>

      {children.map((c) => {
        return (
          <OpenDiaryChildren
            key={c.id}
            c={c}
            blockConnections={blockConnections}
          />
        );
      })}
    </div>
  );
};
