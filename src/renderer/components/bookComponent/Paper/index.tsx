import { useEffect, useState, type ReactNode } from "react";
import "./styles.css";

type PaperProps = {
  frontContent: ReactNode;
  backContent: ReactNode;
  zIndex: number;
  flippedFn?: () => void;
  flippedBackFn?: () => void;
  shouldHideBackEdge?: boolean;

  scrollTo: boolean;
};

export const Paper = ({
  frontContent,
  backContent,
  zIndex,
  flippedFn,
  flippedBackFn,
  shouldHideBackEdge,
  scrollTo,
}: PaperProps) => {
  const [isAddListener, setIsAddListener] = useState<{
    type: "FRONT" | "BACK";
  } | null>(null);

  const [degrees, setDegrees] = useState<number>(0);
  const [x, setX] = useState<number | null>(null);
  const [tempIndexBack, setTempIndexBack] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!x) return;

      const mul = 0.7;
      let result: number;

      if (isAddListener?.type === "FRONT") {
        result = x * mul - e.clientX * mul;
      } else {
        result = 180 - (e.clientX * mul - x * mul);
      }

      if (result < 0) {
        result = 0;
      }

      result = result > 180 ? 180 : result;
      setDegrees(-result);

      document.body.style.cursor = "grab";
    };

    const handleMouseUp = () => {
      if (isAddListener?.type === "FRONT") {
        if (degrees < -180 / 2) {
          setDegrees(-180);

          if (flippedFn) {
            flippedFn();
          }
        } else {
          setDegrees(0);
        }
      }

      if (isAddListener?.type === "BACK") {
        if (degrees > -180 / 2) {
          setDegrees(0);

          if (flippedBackFn) {
            flippedBackFn();
          }
        } else {
          setDegrees(-180);
        }
      }

      setIsAddListener(null);
      setTempIndexBack(false);
      document.body.style.cursor = "auto";
    };

    if (isAddListener !== null) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isAddListener, x, degrees]);

  useEffect(() => {
    if (scrollTo !== false) {
      setDegrees(-180);

      return;
    }
  }, [scrollTo]);

  return (
    <div
      className="paper"
      style={{
        zIndex: tempIndexBack ? 51 : zIndex,
      }}
    >
      <div
        className="front"
        style={
          degrees
            ? {
                transform: `rotateY(${degrees}deg)`,
              }
            : {}
        }
      >
        <div className="front-content">
          <div className="front-content-inner">{frontContent}</div>
        </div>

        <div
          onMouseDown={(e) => {
            setX(e.clientX);
            setIsAddListener({ type: "FRONT" });
          }}
          className={`front-grab-end ${isAddListener?.type === "FRONT" ? "folding-effect" : ""} ${isAddListener?.type === "BACK" ? "folding-effect-back" : ""}`}
        >
          <div className="edge"></div>
          <div className="other-page-end"></div>
        </div>
      </div>
      <div
        className="back"
        style={
          degrees
            ? {
                transform: `rotateY(${degrees}deg)`,
              }
            : {}
        }
      >
        <div className="back-content">
          <div className="back-content-inner">{backContent}</div>
        </div>

        <div
          onMouseDown={(e) => {
            setX(e.clientX);
            setIsAddListener({ type: "BACK" });

            setTempIndexBack(true);
          }}
          className={`back-grab-end ${isAddListener?.type === "BACK" ? "folding-effect" : ""} ${isAddListener?.type === "FRONT" ? "folding-effect-back" : ""}`}
        >
          <div
            className="edge"
            style={shouldHideBackEdge ? { backgroundColor: "transparent" } : {}}
          ></div>
          <div className="other-page-end"></div>
        </div>
      </div>
    </div>
  );
};
