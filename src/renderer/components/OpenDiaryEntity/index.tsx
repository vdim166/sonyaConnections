import { useEffect, useState } from 'react';
import { figureType } from '../../../main/classes/databaseManager';
import './styles.css';
import { OpenDiaryChildren } from '../OpenDiaryChildren';
import { ArrowDown } from '../../icons/ArrowDown';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { extendedFigureType } from '../modals/OpenDiaryModal';

type OpenDiaryEntityProps = {
  block: extendedFigureType;
  children: extendedFigureType[] | undefined;
  blockConnections: {
    [key: string]: extendedFigureType[];
  };
};

export const OpenDiaryEntity = ({
  block,
  children,
  blockConnections,
}: OpenDiaryEntityProps) => {
  const [showChildren, setShowChildren] = useState<extendedFigureType[]>([]);
  const [isClicked, setIsClicked] = useState(block.isOpenByDefault);

  const { currentDiary, setCurrentDiary } = useDiaryContext();

  useEffect(() => {
    if (isClicked) {
      if (children) {
        setShowChildren(children);
      }
    } else {
      setShowChildren([]);
    }
  }, [isClicked, children]);

  return (
    <div className="open-diary-modal-entity">
      <div
        className="open-diary-modal-block-container"
        onClick={() => {
          setCurrentDiary(block);
        }}
      >
        <div
          className={`open-diary-modal-block ${currentDiary?.id === block.id ? 'open-diary-modal-block-active' : ''}`}
        >
          {block.name}
        </div>
        <div
          className={`open-diary-modal-block-arrow-down ${isClicked ? 'open-diary-modal-block-arrow-down-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsClicked((prev) => !prev);
          }}
        >
          <ArrowDown />
        </div>
      </div>

      {showChildren.map((c) => {
        return <OpenDiaryChildren c={c} blockConnections={blockConnections} />;
      })}
    </div>
  );
};
