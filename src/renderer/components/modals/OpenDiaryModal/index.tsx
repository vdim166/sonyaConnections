import { useEffect, useState } from 'react';
import { useModalsManagerContext } from '../../../hooks/useModalsManagerContext';
import { BackArrow } from '../../../icons/BackArrow';
import './styles.css';
import { appSignals } from '../../../classes/appSignals';
import { figureType } from '../../../../main/classes/databaseManager';
import { OpenDiaryEntity } from '../../OpenDiaryEntity';
import { EditDiary } from '../../EditDiary';
import { useDiaryContext } from '../../../hooks/useDiaryContext';
import { FETCH_SIGNALS } from '../../../classes/consts/FETCH_SIGNALS';

export type OpenDiaryModalProps = {
  id: string | null;
};

export type extendedFigureType = figureType & {
  isOpenByDefault: boolean;
};
export const OpenDiaryModal = ({ id }: OpenDiaryModalProps) => {
  const { closeModals } = useModalsManagerContext();

  const { setCurrentDiary } = useDiaryContext();

  const [blocks, setBlocks] = useState<extendedFigureType[] | null>(null);

  const [blockConnections, setBlockConnections] = useState<{
    [key: string]: extendedFigureType[];
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

        const openArray: string[] = [];

        if (id) {
          const blockConnectionsKeys = Object.keys(blockConnections);

          for (let i = 0; i < blockConnectionsKeys.length; ++i) {
            const objs = blockConnections[blockConnectionsKeys[i]];

            for (let j = 0; j < objs.length; ++j) {
              const obj = objs[j];

              if (obj.id === id) {
                const key = blockConnectionsKeys[i];

                const buffer = [key];

                while (buffer.length > 0) {
                  const key = buffer.shift();

                  if (!key) break;

                  openArray.push(key);

                  for (let k = 0; k < blockConnectionsKeys.length; ++k) {
                    const conns = blockConnections[blockConnectionsKeys[k]];

                    for (let l = 0; l < conns.length; ++l) {
                      if (conns[l].id === key) {
                        buffer.push(blockConnectionsKeys[k]);
                      }
                    }
                  }
                }

                // if needed only once
                // break
              }
            }
          }
        }

        const modBlockConnections: { [key: string]: extendedFigureType[] } = {};

        const blockConnectionsKeys = Object.keys(blockConnections);

        for (let i = 0; i < blockConnectionsKeys.length; ++i) {
          const objs = blockConnections[blockConnectionsKeys[i]];

          for (let j = 0; j < objs.length; ++j) {
            if (modBlockConnections[blockConnectionsKeys[i]]) {
              modBlockConnections[blockConnectionsKeys[i]].push({
                ...objs[j],
                isOpenByDefault: openArray.includes(objs[j].id),
              });
            } else {
              modBlockConnections[blockConnectionsKeys[i]] = [
                {
                  ...objs[j],
                  isOpenByDefault: openArray.includes(objs[j].id),
                },
              ];
            }
          }
        }

        setBlockConnections(modBlockConnections);
        setBlocks(
          blocks.map((b) => {
            return { ...b, isOpenByDefault: openArray.includes(b.id) };
          }),
        );

        return figures;
      } catch (error) {
        console.log('error', error);
      }
    };

    const setFigure = async () => {
      try {
        const figures = await fetchFigures();
        if (id && figures) {
          const figure = figures.find((item) => item.id === id);
          if (figure) {
            setCurrentDiary(figure);
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    setFigure();

    const fetchDiaryFigures = () => {
      fetchFigures();
    };

    window.addEventListener(
      FETCH_SIGNALS.FETCH_DIARY_FIGURES,
      fetchDiaryFigures,
    );

    return () => {
      window.removeEventListener(
        FETCH_SIGNALS.FETCH_DIARY_FIGURES,
        fetchDiaryFigures,
      );
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
