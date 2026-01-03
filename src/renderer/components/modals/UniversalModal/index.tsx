import './styles.css';

type UniversalModalType = {
  children: React.ReactNode;
};

export const UniversalModal = ({ children }: UniversalModalType) => {
  return (
    <div className="universal-modal">
      <div className="modal-main">{children}</div>
    </div>
  );
};
