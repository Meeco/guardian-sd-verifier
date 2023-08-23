import { useContext, useMemo, useState } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import pairWallet from "../../bladeWeb3Service/pairWallet";
import generateRequesterKeys from "../../utils/generateRequesterKeys";
import { AppContext } from "../AppProvider";
import { StatusLabel } from "../common";

const HederaAccount = () => {
  const {
    bladeConnector,
    setSigner,
    signer,
    accountId,
    setaccountId,
    setRequesterPrivateKey,
    requesterPrivateKey,
  } = useContext(AppContext);

  const [keyStr, setKeyStr] = useState("");
  const [verifyPrivateKeyErrMsg, setVerifyPrivateKeyErrMsg] = useState<
    string | undefined
  >();

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

  const handleChangePrivateKey = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setKeyStr(e.target.value);
  };

  const verifyPrivateKey = () => {
    try {
      const requesterPrivateKey = generateRequesterKeys(keyStr);
      setRequesterPrivateKey(requesterPrivateKey);
      setVerifyPrivateKeyErrMsg(undefined);
    } catch (error) {
      console.log({ error });
      setVerifyPrivateKeyErrMsg((error as any).message);
      setRequesterPrivateKey(undefined);
    }
  };

  const verifyStatus = useMemo(() => {
    if (verifyPrivateKeyErrMsg === undefined) {
      if (requesterPrivateKey) {
        return true;
      }
    } else return false;
  }, [requesterPrivateKey, verifyPrivateKeyErrMsg]);

  return (
    <Accordion.Item eventKey="account">
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
        {connectWalletSuccess && (
          <div>
            Hedera account's private key (ED25519)
            <Form.Control
              type="text"
              placeholder="Hedera account's private key"
              onChange={handleChangePrivateKey}
              className="w-50"
            />
            <div className="d-flex mt-3">
              <Button onClick={verifyPrivateKey} disabled={keyStr === ""}>
                Verify private key
              </Button>
              <StatusLabel
                isSuccess={verifyStatus}
                text={verifyPrivateKeyErrMsg ?? "Verified"}
              />
            </div>
          </div>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default HederaAccount;
