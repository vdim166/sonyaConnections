import { useRef } from "react";
import { PageCounter } from "../PageCounter";
import "./styles.css";

type PaperContentProps = {
  currentPaper: number;
  allPapers: number;
  content: string;
  setContent: (content: string) => void;

  nextPageHandle: (letter: string) => void;
};

export const PaperContent = ({
  currentPaper,
  allPapers,
  content,
  setContent,

  nextPageHandle,
}: PaperContentProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkScroll = () => {
    if (textareaRef.current) {
      const { scrollHeight, clientHeight } = textareaRef.current;
      // Если высота содержимого больше видимой высоты, значит есть скролл
      const hasScrollbar = scrollHeight > clientHeight;

      return hasScrollbar;
    }

    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const isChanged = checkScroll();

    if (isChanged) {
      const lastChar = e.target.value[e.target.value.length - 1];
      nextPageHandle(lastChar);

      setContent(e.target.value.slice(0, e.target.value.length - 1));

      if (textareaRef.current) textareaRef.current.blur();
    } else {
      setContent(e.target.value);
    }
  };

  return (
    <div className="paper-content">
      <div className="page-counter-container">
        <PageCounter currentPaper={currentPaper} allPapers={allPapers} />
      </div>

      <div className="paper-content-textarea-container">
        <textarea
          className="paper-content-textarea"
          ref={textareaRef}
          value={content}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
