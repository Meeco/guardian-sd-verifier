import { Button, useAccordionButton } from "react-bootstrap";
import StatusLabel from "./StatusLabel";

const AccordianToggleButton = ({
  text,
  eventKey,
  disabled,
  isSuccess,
  statusText,
}: {
  text: string;
  eventKey: string;
  disabled?: boolean;
  isSuccess?: boolean;
  statusText?: string;
}) => {
  const handleToggle = useAccordionButton(eventKey);

  return (
    <>
      <Button onClick={handleToggle} disabled={disabled}>
        {text}
      </Button>
      {statusText && <StatusLabel isSuccess={isSuccess} text={statusText} />}
    </>
  );
};
export default AccordianToggleButton;
