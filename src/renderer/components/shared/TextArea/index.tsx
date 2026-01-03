import './styles.css';

export const TextArea = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>) => {
  return (
    <textarea
      className={`custom-textarea ${className ?? ''}`}
      {...props}
    ></textarea>
  );
};
