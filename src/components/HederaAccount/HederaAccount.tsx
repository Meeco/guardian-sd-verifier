import { useContext, useMemo, useState } from "react";
import { Accordion, Button, Dropdown } from "react-bootstrap";
import { EventKey } from "../../constants";
import { pairWallet } from "../../hashConnectService";
import { AppContext, NetworkType } from "../AppProvider";
import { AccordianToggleButton, StatusLabel } from "../common";
import ChangeNetworkModal from "./ChangeNetworkModal";

const HederaAccount = () => {
  const {
    accountId,
    setAccountId,
    signer,
    setSigner,
    hashconnect,
    hashConnectData,
    network,
    setNetwork,
  } = useContext(AppContext);

  const [displayConnect, setDisplayConnect] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(network);
  const [displayModal, setDisplayModal] = useState(false);

  const availableNetWorks = [NetworkType.testnet, NetworkType.mainnet];

  const handleConnectWallet = () => {
    pairWallet({ hashconnect, hashConnectData, setAccountId, setSigner });
  };

  const handleDisconnect = (reload?: boolean) => {
    if (hashConnectData) {
      hashconnect?.disconnect(hashConnectData?.topic);
      hashconnect?.clearConnectionsAndData();
    }
    if (reload) {
      window.location.reload();
    }
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

  const handleSelectNetwork = (network: NetworkType) => {
    setSelectedNetwork(network);
    setDisplayModal(true);
  };

  const handleClose = () => {
    setDisplayModal(false);
  };

  const handleConfirm = () => {
    handleDisconnect();
    setNetwork(selectedNetwork);
    window.location.reload();
  };

  return (
    <>
      <ChangeNetworkModal
        show={displayModal}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
      <Accordion.Item eventKey={EventKey.HederaAccount}>
        <Accordion.Header>
          <b>Hedera Account&nbsp;</b> {accountId ? `(${accountId})` : undefined}
        </Accordion.Header>
        <Accordion.Body>
          <p className="fst-italic">
            Connect a Header HBar wallet to pay for transactions to HCS and HFS.
          </p>
          <div className="my-3">
            <p>Select Hedera network</p>
            <Dropdown>
              <Dropdown.Toggle>{network}</Dropdown.Toggle>
              <Dropdown.Menu>
                {availableNetWorks.map((item) => (
                  <Dropdown.Item
                    key={item}
                    active={item === network}
                    onClick={() => handleSelectNetwork(item)}
                  >
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="connect-btn-group mb-3">
            <Button
              onMouseEnter={handleHover}
              onMouseLeave={handleHover}
              onClick={
                displayConnect
                  ? handleConnectWallet
                  : () => handleDisconnect(true)
              }
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
    </>
  );
};

export default HederaAccount;
