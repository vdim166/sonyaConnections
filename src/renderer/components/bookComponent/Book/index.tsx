import { useEffect, useState } from 'react';
import { Paper } from '../Paper';
import './styles.css';
import { Cover } from '../Cover';
import { PaperContent } from '../PaperContent';

type BookProps = {
  paperContent: string[];
  setPaperContent: React.Dispatch<React.SetStateAction<string[]>>;
};

export const Book = ({ paperContent, setPaperContent }: BookProps) => {
  const [currentPaper, setCurrentPaper] = useState(0);

  const calcZIndex = (index: number, defaultIndex: number) => {
    if (currentPaper - 1 === index) return 49;

    if (currentPaper === index) return 50;

    if (currentPaper - 2 === index) return 48;

    return defaultIndex;
  };

  const [scrollTo, setScrollTo] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  const setContentByIndex = (index: number, value: string) => {
    setPaperContent((prev) => {
      const newState = [...prev];
      newState[index] = value;
      return newState;
    });
  };

  const nextPageHandle = (
    letter: string,
    index: number,
    paperIndex: number,
  ) => {
    setPaperContent((prev) => {
      const newState = [...prev];

      newState[index] = `${letter}${newState[index]}`;

      return newState;
    });

    const pageToScroll = Math.ceil((paperIndex + 1) / 2);

    if (currentPaper !== pageToScroll) {
      setCurrentPaper(pageToScroll);
      setScrollTo((prev) => {
        const newState = [...prev];

        for (let i = 0; i < pageToScroll; ++i) {
          newState[i] = true;
        }

        return newState;
      });
    }
  };

  useEffect(() => {
    const index = scrollTo.findIndex((item) => item === true);

    if (index !== -1) {
      setScrollTo([false, false, false, false, false]);
    }
  }, [scrollTo]);

  // open section
  useEffect(() => {
    setScrollTo((prev) => {
      const newState = [...prev];
      newState[0] = true;
      return newState;
    });
    setTimeout(() => {
      setCurrentPaper(1);
    }, 500);
  }, []);

  return (
    <>
      <div className="book">
        <Cover
          zIndex={calcZIndex(0, 5)}
          flippedFn={() => {
            setCurrentPaper(1);
          }}
          flippedBackFn={() => {
            setCurrentPaper(0);
          }}
          scrollTo={scrollTo[0]}
        />

        <Paper
          frontContent={
            <PaperContent
              currentPaper={1}
              allPapers={6}
              content={paperContent[0]}
              setContent={(value) => setContentByIndex(0, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 1, 2);
              }}
            />
          }
          backContent={
            <PaperContent
              currentPaper={2}
              allPapers={6}
              content={paperContent[1]}
              setContent={(value) => setContentByIndex(1, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 2, 3);
              }}
            />
          }
          scrollTo={scrollTo[1]}
          zIndex={calcZIndex(1, 4)}
          flippedFn={() => {
            setCurrentPaper(2);
          }}
          flippedBackFn={() => {
            setCurrentPaper(1);
          }}
          shouldHideBackEdge={currentPaper === 1}
        />

        <Paper
          frontContent={
            <PaperContent
              currentPaper={3}
              allPapers={6}
              content={paperContent[2]}
              setContent={(value) => setContentByIndex(2, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 3, 4);
              }}
            />
          }
          backContent={
            <PaperContent
              currentPaper={4}
              allPapers={6}
              content={paperContent[3]}
              setContent={(value) => setContentByIndex(3, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 4, 5);
              }}
            />
          }
          scrollTo={scrollTo[2]}
          zIndex={calcZIndex(2, 3)}
          flippedFn={() => {
            setCurrentPaper(3);
          }}
          flippedBackFn={() => {
            setCurrentPaper(2);
          }}
          shouldHideBackEdge={currentPaper === 2}
        />

        <Paper
          frontContent={
            <PaperContent
              currentPaper={5}
              allPapers={6}
              content={paperContent[4]}
              setContent={(value) => setContentByIndex(4, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 5, 6);
              }}
            />
          }
          backContent={
            <PaperContent
              currentPaper={6}
              allPapers={6}
              content={paperContent[5]}
              setContent={(value) => setContentByIndex(5, value)}
              nextPageHandle={(letter) => {
                nextPageHandle(letter, 6, 7);
              }}
            />
          }
          scrollTo={scrollTo[3]}
          zIndex={calcZIndex(3, 2)}
          flippedFn={() => {
            setCurrentPaper(4);
          }}
          flippedBackFn={() => {
            setCurrentPaper(3);
          }}
          shouldHideBackEdge={currentPaper === 3}
        />
        <Cover
          scrollTo={scrollTo[4]}
          zIndex={calcZIndex(4, 1)}
          flippedFn={() => {
            setCurrentPaper(5);
          }}
          flippedBackFn={() => {
            setCurrentPaper(4);
          }}
        />
      </div>
    </>
  );
};
