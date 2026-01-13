import { useEffect, useState } from 'react';
import { useModalsManagerContext } from '../../../hooks/useModalsManagerContext';
import { BackArrow } from '../../../icons/BackArrow';
import './styles.css';
import { appSignals } from '../../../classes/appSignals';
import { figureType } from '../../../../main/classes/databaseManager';
import { OpenDiaryEntity } from '../../OpenDiaryEntity';
import { EditDiary } from '../../EditDiary';
import { useDiaryContext } from '../../../hooks/useDiaryContext';

export type OpenDiaryModalProps = {
  id: string | null;
};

export const OpenDiaryModal = ({ id }: OpenDiaryModalProps) => {
  const { closeModals } = useModalsManagerContext();

  const { setCurrentDiary } = useDiaryContext();

  const [blocks, setBlocks] = useState<figureType[] | null>(null);

  const [blockConnections, setBlockConnections] = useState<{
    [key: string]: figureType[];
  }>({});

  useEffect(() => {
    const fetchFigures = async () => {
      try {
        const figures = await appSignals.getFigures();

        const connections = await appSignals.getConnections();

        const blocks = [];

        for (let i = 0; i < figures.length; ++i) {
          const figure = figures[i];

          if (figure.isBlock) {
            blocks.push(figure);
          }
        }

        const blockConnections: { [key: string]: figureType[] } = {};

        if (connections) {
          for (let i = 0; i < figures.length; ++i) {
            const block = figures[i];

            for (let j = 0; j < connections.length; ++j) {
              const connection = connections[j];

              const [startId] = connection.startAnchorId.split('-');

              if (startId === block.id) {
                const [endId] = connection.endAnchorId.split('-');

                const figure = figures.find((item) => item.id === endId);

                if (figure) {
                  if (blockConnections[block.id]) {
                    blockConnections[block.id].push(figure);
                  } else {
                    blockConnections[block.id] = [figure];
                  }
                }

                continue;
              }
            }
          }
        }

        setBlockConnections(blockConnections);
        setBlocks(blocks);

        if (id) {
          const figure = figures.find((item) => item.id === id);
          if (figure) {
            setCurrentDiary(figure);

            if (!figure.isBlock) {
              console.log('blockConnections', blockConnections);
            }
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchFigures();

    const fetchDiaryFigures = () => {
      fetchFigures();
    };

    window.addEventListener('FETCH_DIARY_FIGURES', fetchDiaryFigures);

    return () => {
      window.removeEventListener('FETCH_DIARY_FIGURES', fetchDiaryFigures);
    };
  }, [id]);

  return (
    <div className="open-diary-modal">
      <div className="open-diary-modal-back-arrow" onClick={closeModals}>
        <BackArrow />
      </div>

      <div className="open-diary-modal-title">DIARY</div>
      <div className="open-diary-modal-main">
        <div className="open-diary-modal-sidebar">
          {blocks?.map((block) => {
            return (
              <OpenDiaryEntity
                key={block.id}
                block={block}
                children={blockConnections[block.id]}
                blockConnections={blockConnections}
              />
            );
          })}
        </div>
        <EditDiary />
      </div>
    </div>
  );
};
