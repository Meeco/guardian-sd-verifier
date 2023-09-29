import { useContext, useMemo, useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import pairWallet from "../../bladeWeb3Service/pairWallet";
import { EventKey } from "../../constants";
import { AppContext } from "../AppProvider";
import { AccordianToggleButton, StatusLabel } from "../common";

const HederaAccount = () => {
  const { bladeConnector, setSigner, signer, accountId, setaccountId } =
    useContext(AppContext);

  const [displayConnect, setDisplayConnect] = useState(true);

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

  const handleDisconnect = async () => {
    await bladeConnector.killSession();
    setSigner(null);
    setaccountId("");
  };

  const handleHover = () => {
    if (signer) {
      setDisplayConnect((prev) => !prev);
    }
  };

  console.log({ displayConnect });

  const connectWalletSuccess = useMemo(() => {
    if (signer) return true;
    else return undefined;
  }, [signer]);

  const renderConnectButton = () => (
    <>
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
    </>
  );

  return (
    <Accordion.Item eventKey={EventKey.HederaAccount}>
      <Accordion.Header>
        <b>Hedera Account&nbsp;</b> {accountId ? `(${accountId})` : undefined}
      </Accordion.Header>
      <Accordion.Body>
        <p className="fst-italic">
          Connect a Header HBar wallet to pay for transactions to HCS and HFS.
        </p>
        <div className="connect-btn-group mb-3">
          <Button
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            onClick={displayConnect ? handleConnectWallet : handleDisconnect}
            variant={displayConnect ? "outline-primary" : "danger"}
          >
            {displayConnect ? renderConnectButton() : "Disconnect"}
          </Button>
          <StatusLabel isSuccess={connectWalletSuccess} text="Connected" />
        </div>

        <AccordianToggleButton
          text="Next"
          disabled={!connectWalletSuccess}
          eventKey={EventKey.Identity}
        />
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default HederaAccount;
