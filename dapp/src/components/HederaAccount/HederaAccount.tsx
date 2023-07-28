import { BladeSigner } from "@bladelabs/blade-web3.js";
import { useMemo } from "react";
import { Button } from "react-bootstrap";
import { StatusLabel } from "../common";

interface HederaAccountProps {
  handleConnectWallet: () => void;
  signer: BladeSigner | null;
  accountID: string;
}

const HederaAccount: React.FC<HederaAccountProps> = ({
  handleConnectWallet,
  signer,
  accountID,
}) => {
  const isSuccess = useMemo(() => {
    if (signer) return true;
    else return undefined;
  }, [signer]);

  return (
    <div>
      <p>
        Connect a Header HBar wallet to pay for transactions to HCS and HFS.
      </p>
      <div className="d-flex mb-3">
        <Button
          onClick={handleConnectWallet}
          disabled={!!signer}
          variant="outline-primary"
        >
          {accountID ? (
            `Connected: ${accountID}`
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
        <StatusLabel isSuccess={isSuccess} text="Connected" />
      </div>
    </div>
  );
};

export default HederaAccount;
