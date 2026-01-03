import './styles.css';

export const Button = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) => {
  return (
    <button className={`custom-button ${className ?? ''}`} {...props}></button>
  );
};
