import { useContext, useMemo } from "react";
import { Accordion, Button } from "react-bootstrap";
import { EventKey } from "../../constants";
import { pairWallet } from "../../hashConnectService";
import { AppContext } from "../AppProvider";
import { AccordianToggleButton, StatusLabel } from "../common";

const HederaAccount = () => {
  const {
    accountId,
    setAccountId,
    setSigner,
    hashconnect,
    hashConnectData,
    signer,
  } = useContext(AppContext);

  const handleConnectWallet = () => {
    pairWallet({ hashconnect, hashConnectData, setAccountId, setSigner });
  };

  const connectWalletSuccess = useMemo(() => {
    if (signer?.getAccountId()) return true;
    else return undefined;
  }, [signer]);

  return (
    <Accordion.Item eventKey={EventKey.HederaAccount}>
      <Accordion.Header>
        <b>Hedera Account&nbsp;</b> {accountId ? `(${accountId})` : undefined}
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
              <div className="d-flex align-items-center">Connect to Wallet</div>
            )}
          </Button>
          <StatusLabel isSuccess={connectWalletSuccess} text="Connected" />
        </div>
        <div>
          <AccordianToggleButton
            text="Next"
            disabled={!connectWalletSuccess}
            eventKey={EventKey.Identity}
          />
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default HederaAccount;
