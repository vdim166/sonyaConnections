import { Close } from '../../../../icons/Close';
import './styles.css';

type CloseModalProps = {
  onClick: () => void;
};

export const CloseModal = ({ onClick }: CloseModalProps) => {
  return (
    <div className="close-modal" onClick={onClick}>
      <Close />
    </div>
  );
};
