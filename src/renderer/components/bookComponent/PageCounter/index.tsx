import "./styles.css";

type PageCounterProps = {
  currentPaper: number;
  allPapers: number;
};

export const PageCounter = ({ currentPaper, allPapers }: PageCounterProps) => {
  return (
    <div className="page-counter">
      Page {currentPaper} of {allPapers}
    </div>
  );
};
