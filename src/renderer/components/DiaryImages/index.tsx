import { useEffect, useRef, useState } from 'react';
import { Plus } from '../../icons/Plus';
import './styles.css';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';
import { appSignals } from '../../classes/appSignals';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { DiaryImage } from '../DiaryImage';

export const DiaryImages = () => {
  const { currentDiary, setCurrentDiary } = useDiaryContext();

  const [images, setImages] = useState<{ data: string; id: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    inputRef.current?.click();
  };

  const handleImageFile = async (files: FileList) => {
    try {
      if (!currentDiary) return;

      const images: Uint8Array<ArrayBuffer>[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        const uint8Array = new Uint8Array(arrayBuffer);

        images.push(uint8Array);
      }

      const newDiary = await appSignals.addImagesForFigure(
        currentDiary.id,
        images,
      );

      setCurrentDiary(newDiary);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_DIARY_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (currentDiary && currentDiary.images) {
          const images = [];
          for (let i = 0; i < currentDiary.images.length; ++i) {
            const imageId = currentDiary.images[i];

            const image = await appSignals.getFigureImage(imageId);

            images.push({ data: image, id: imageId });
          }

          setImages(images);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchImages();
  }, [currentDiary]);

  return (
    <div className="diary-images-container">
      {images.map((image) => {
        return <DiaryImage image={image} />;
      })}
      <div className="add-diary-image" onClick={handleAddImage}>
        <Plus />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{
            display: 'none',
          }}
          onChange={async (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
              await handleImageFile(files);

              if (inputRef.current) {
                inputRef.current.value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};
