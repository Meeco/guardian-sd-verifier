import { FC } from "react";
import { Button, Modal } from "react-bootstrap";

interface ChangeNetworkModalProps {
  show: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

const ChangeNetworkModal: FC<ChangeNetworkModalProps> = ({
  show,
  handleClose,
  handleConfirm,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Changing network</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        To switch the network, it will disconnect current connection and refresh
        the page. Do you want to proceed?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeNetworkModal;
