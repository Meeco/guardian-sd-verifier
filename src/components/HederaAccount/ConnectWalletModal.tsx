import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import QRCode from "qrcode";
import { FC, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface ConnectWalletModalProps {
  show: boolean;
  pairingString?: string;
  hashconnect?: HashConnect;
  handleConnectWallet: () => void;
  handleClose: () => void;
  hashConnectData?: HashConnectTypes.InitilizationData;
  setAccountId: React.Dispatch<React.SetStateAction<string>>;
  setSigner: React.Dispatch<
    React.SetStateAction<HashConnectSigner | undefined>
  >;
  setProvider: React.Dispatch<React.SetStateAction<any>>;
}

const ConnectWalletModal: FC<ConnectWalletModalProps> = ({
  show,
  pairingString,
  hashconnect,
  handleClose,
  handleConnectWallet,
  hashConnectData,
  setAccountId,
  setSigner,
  setProvider,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleCopy = () => {
    if (pairingString) navigator.clipboard.writeText(pairingString);
  };
  useEffect(() => {
    if (pairingString)
      QRCode.toDataURL(pairingString).then((url) => setQrCodeUrl(url));
  }, [pairingString]);

  useEffect(() => {
    if (hashconnect && hashConnectData)
      hashconnect.pairingEvent.on((pairingData) => {
        setAccountId(pairingData.accountIds[0]);

        const provider = hashconnect.getProvider(
          "testnet",
          hashConnectData.topic,
          pairingData.accountIds[0]
        );
        setProvider(provider);

        const signer = hashconnect.getSigner(provider);
        setSigner(signer);
        handleClose();
      });
  }, [
    handleClose,
    hashConnectData,
    hashconnect,
    setAccountId,
    setProvider,
    setSigner,
  ]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Connect to wallet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <b className="mb-2 d-block">Pair with code:</b>
          <div className="d-flex mb-3">
            <Form.Control
              type="text"
              readOnly
              value={pairingString}
              className="me-3"
            />
            <Button variant="outline-primary" onClick={handleCopy}>
              Copy
            </Button>
          </div>
        </div>
        <div>
          <b className="mb-2">Pair with QR code:</b>
          <img src={qrCodeUrl} alt="qrcode" />
        </div>
        <div>
          <b className="mb-2 d-block">Pair with installed extension:</b>
          <Button variant="outline-primary" onClick={handleConnectWallet}>
            Connect with Hashpack
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConnectWalletModal;
