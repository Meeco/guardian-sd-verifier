import { useContext, useMemo, useState } from "react";
import { Accordion, Button, Dropdown } from "react-bootstrap";
import { EventKey } from "../../constants";
import { AppContext, NetworkType } from "../AppProvider";
import { AccordianToggleButton, StatusLabel } from "../common";
import ChangeNetworkModal from "./ChangeNetworkModal";
import ConnectWalletModal from "./ConnectWalletModal";

const HederaAccount = () => {
  const {
    accountId,
    setAccountId,
    signer,
    setSigner,
    setProvider,
    hashconnect,
    hashConnectData,
    network,
    setNetwork,
  } = useContext(AppContext);

  const [displayConnect, setDisplayConnect] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(network);
  const [displayChangeNetworkModal, setDisplayChangeNetworkModal] =
    useState(false);
  const [displayConnectWalletModal, setDisplayConnectWalletModal] =
    useState(false);

  const availableNetWorks = [NetworkType.testnet, NetworkType.mainnet];

  const handleConnectWallet = () => {
    if (hashconnect) hashconnect.connectToLocalWallet();
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
    setDisplayChangeNetworkModal(true);
  };

  const handleCloseChangeNetworkModal = () => {
    setDisplayChangeNetworkModal(false);
  };

  const handleConfirmChangeNetworkModal = () => {
    handleDisconnect();
    setNetwork(selectedNetwork);
    window.location.reload();
  };

  const handleClickConnectButton = () => {
    setDisplayConnectWalletModal(true);
  };

  const handleCloseConnectWaletModal = () => {
    setDisplayConnectWalletModal(false);
  };

  return (
    <>
      <ChangeNetworkModal
        show={displayChangeNetworkModal}
        handleClose={handleCloseChangeNetworkModal}
        handleConfirm={handleConfirmChangeNetworkModal}
      />
      <ConnectWalletModal
        show={displayConnectWalletModal}
        handleClose={handleCloseConnectWaletModal}
        handleConnectWallet={handleConnectWallet}
        hashconnect={hashconnect}
        pairingString={hashConnectData?.pairingString}
        hashConnectData={hashConnectData}
        setAccountId={setAccountId}
        setSigner={setSigner}
        setProvider={setProvider}
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
                  ? handleClickConnectButton
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
