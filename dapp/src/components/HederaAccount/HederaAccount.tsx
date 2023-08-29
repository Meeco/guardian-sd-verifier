import { useContext, useMemo } from "react";
import { Accordion, Button } from "react-bootstrap";
import pairWallet from "../../bladeWeb3Service/pairWallet";
import { EventKey } from "../../constants";
import { AppContext } from "../AppProvider";
import { AccordianToggleButton, StatusLabel } from "../common";

const HederaAccount = () => {
  const { bladeConnector, setSigner, signer, accountId, setaccountId } =
    useContext(AppContext);

  const handleConnectWallet = () => {
    if (bladeConnector) {
      pairWallet(bladeConnector).then(async (accId) => {
        const signer = bladeConnector.getSigner();
        if (signer) {
          setSigner(signer);
          setaccountId(accId);
        }
      });
    } else {
      console.log("bladeConnector is not found");
    }
  };

  const connectWalletSuccess = useMemo(() => {
    if (signer) return true;
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
