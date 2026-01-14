import { MODALS_STATES } from '../../../context/ModalsManagerContext';
import { useModalsManagerContext } from '../../../hooks/useModalsManagerContext';
import { CloseModal } from '../shared/CloseModal';
import './styles.css';

export type ImageViewerProps = {
  data: string;
};
export const ImageViewer = ({ data }: ImageViewerProps) => {
  const { deleteModalById } = useModalsManagerContext();

  return (
    <div className="image-viewer-container">
      <CloseModal
        onClick={() => {
          deleteModalById(MODALS_STATES.IMAGE_VIEWER);
        }}
      />

      <div className="image-viewer">
        <img src={`data:image/png;base64,${data}`} />
      </div>
    </div>
  );
};
