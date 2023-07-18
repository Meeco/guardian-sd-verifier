import { Form } from "react-bootstrap";

interface WalletInfoProps {
  setAccountId: React.Dispatch<React.SetStateAction<string>>;
  setPrivateKey: React.Dispatch<React.SetStateAction<string>>;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  setAccountId,
  setPrivateKey,
}) => {
  const handleChangeAccountId = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setAccountId(e.target.value);
  };

  const handleChangePrivateKey = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setPrivateKey(e.target.value);
  };

  return (
    <div>
      <Form.Label>Account ID</Form.Label>
      <Form.Control
        type="text"
        placeholder="Account ID"
        onChange={handleChangeAccountId}
      />
      <Form.Label>Private Key</Form.Label>
      <Form.Control
        type="text"
        placeholder="Private Key"
        onChange={handleChangePrivateKey}
      />
    </div>
  );
};

export default WalletInfo;
