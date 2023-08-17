import { BladeSigner } from "@bladelabs/blade-web3.js";
import { useMemo } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { StatusLabel } from "../common";

interface HederaAccountProps {
  handleConnectWallet: () => void;
  signer: BladeSigner | null;
  accountId: string;
  requesterPrivateKey: string;
  setRequesterPrivateKey: React.Dispatch<React.SetStateAction<string>>;
}

const HederaAccount: React.FC<HederaAccountProps> = ({
  handleConnectWallet,
  signer,
  accountId,
  requesterPrivateKey,
  setRequesterPrivateKey,
}) => {
  const connectWalletSuccess = useMemo(() => {
    if (signer) return true;
    else return undefined;
  }, [signer]);

  const handleChangePrivateKey = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setRequesterPrivateKey(e.target.value);
  };

  return (
    <Accordion.Item eventKey="account">
      <Accordion.Header>
        <b>Hedera Account </b> {accountId ? `(${accountId})` : undefined}
      </Accordion.Header>
      <Accordion.Body>
        <p>
          Connect a Header HBar wallet to pay for transactions to HCS and HFS.
        </p>
        <div className="d-flex mb-3">
          <Button
            onClick={handleConnectWallet}
            disabled={!!signer}
            variant="outline-primary"
          >
            {accountId ? (
              `Connected: ${accountId}`
            ) : (
              <div className="d-flex align-items-center">
                <img
                  src="/wallet_connect.png"
                  alt="wallet_connect"
                  className="wallet-connect-icon"
                />
                WalletConnect
              </div>
            )}
          </Button>
          <StatusLabel isSuccess={connectWalletSuccess} text="Connected" />
        </div>
        {connectWalletSuccess && (
          <div>
            Hedera account's private key(ED25519)
            <Form.Control
              type="text"
              placeholder="Hedera account's private key"
              onChange={handleChangePrivateKey}
              className="w-50"
            />
          </div>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default HederaAccount;
