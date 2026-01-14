import { appSignals } from '../../classes/appSignals';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { Close } from '../../icons/Close';
import './styles.css';

export type diaryImageType = { data: string; id: string };
type DiaryImageProps = {
  image: diaryImageType;
};

export const DiaryImage = ({ image }: DiaryImageProps) => {
  const { currentDiary, setCurrentDiary } = useDiaryContext();

  const { addModal } = useModalsManagerContext();

  const handleOpenImage = () => {
    addModal({
      type: MODALS_STATES.IMAGE_VIEWER,
      props: {
        data: image.data,
      },
    });
  };

  const handleDeleteImage = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    try {
      e.stopPropagation();

      if (!currentDiary) return;

      const newDiary = await appSignals.removeImageForFigure(
        currentDiary.id,
        image.id,
      );
      setCurrentDiary(newDiary);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="image-wrapper">
      <img
        src={`data:image/png;base64,${image.data}`}
        className="diary-image"
      />
      <div className="image-container" onClick={handleOpenImage}>
        <div className="image-container-close" onClick={handleDeleteImage}>
          <Close />
        </div>
      </div>
    </div>
  );
};
