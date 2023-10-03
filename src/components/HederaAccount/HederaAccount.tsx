import { useContext, useMemo, useState } from "react";
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

  const [displayConnect, setDisplayConnect] = useState(true);

  const handleConnectWallet = () => {
    pairWallet({ hashconnect, hashConnectData, setAccountId, setSigner });
  };

  const handleDisconnect = async () => {
    if (hashConnectData) hashconnect?.disconnect(hashConnectData?.topic);
  };

  const handleHover = () => {
    if (signer) {
      setDisplayConnect((prev) => !prev);
    }
  };

  const connectWalletSuccess = useMemo(() => {
    if (signer?.getAccountId()) return true;
    else return undefined;
  }, [signer]);

  const renderConnectButton = () => (
    <>
      {accountId ? (
        `Connected: ${accountId}`
      ) : (
        <div className="d-flex align-items-center">Connect to wallet</div>
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
