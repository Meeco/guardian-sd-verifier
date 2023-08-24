import { Button as BsButton, Spinner } from "react-bootstrap";

interface ButtonProps {
  onClick: () => void;
  text: string;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  loading,
  disabled,
}) => {
  return (
    <BsButton onClick={onClick} disabled={disabled}>
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="mx-2">Waiting for response...</span>
        </>
      ) : (
        text
      )}
    </BsButton>
  );
};

export default Button;
