import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import "./App.css";
import initConnection from "./bladeWeb3Service/initConnection";
import pairWallet from "./bladeWeb3Service/pairWallet";
import { HederaAccount, Indentity, Loader, Request } from "./components";

function App() {
  // Loading status
  const [loading, setLoading] = useState(false);
  // User uploaded credential
  const [verifiableCredential, setVerifiableCredential] = useState<any>();
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>();
  // Credential's private key
  const [credPrivateKey, setCredPrivateKey] = useState("");
  // Credential's public key
  const [credPublicKey, setCredPublicKey] = useState("");
  // Topic ID for sending/receiving message
  const topicId = process.env.REACT_APP_TOPIC_ID;
  // Blade wallet connector
  const [bladeConnector, setBladeConnector] = useState<
    BladeConnector | undefined
  >();
  // Blade wallet signer(user)
  const [signer, setSigner] = useState<BladeSigner | null>(null);
  // Blade wallet account ID
  const [accountID, setaccountID] = useState("");

  const handleConnectWallet = () => {
    if (bladeConnector) {
      pairWallet(bladeConnector).then(async (accId) => {
        const signer = bladeConnector.getSigner();
        if (signer) {
          setSigner(signer);
          setaccountID(accId);
        }
      });
    } else {
      console.log("bladeConnector is not found");
    }
  };

  useEffect(() => {
    const connector = initConnection();
    setBladeConnector(connector);
  }, []);

  return (
    <div className="App">
      <div className="d-flex align-items-center">
        <img
          src="/hedera_guardian_logo.png"
          alt="hedera_guardian_logo"
          className="app-icon"
        />
        <div>
          <h1>Verifier</h1>
          <h3>Hedera Guardian Selective Disclosure</h3>
        </div>
      </div>
      {loading && <Loader />}
      <Accordion className="mt-4" defaultActiveKey="account">
        <Accordion.Item eventKey="account">
          <Accordion.Header>
            Hedera Account {accountID ? `(${accountID})` : undefined}
          </Accordion.Header>
          <Accordion.Body>
            <HederaAccount
              handleConnectWallet={handleConnectWallet}
              signer={signer}
              accountID={accountID}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="identity">
          <Accordion.Header>Identity</Accordion.Header>
          <Accordion.Body>
            <Indentity
              setLoading={setLoading}
              verifiableCredential={verifiableCredential}
              setVerifiableCredential={setVerifiableCredential}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
              setCredPrivateKey={setCredPrivateKey}
              setCredPublicKey={setCredPublicKey}
            />
          </Accordion.Body>
        </Accordion.Item>
        {credPrivateKey && (
          <Accordion.Item eventKey="request">
            <Accordion.Header>Request</Accordion.Header>
            <Accordion.Body>
              {signer && (
                <Request
                  signer={signer}
                  verifiableCredential={verifiableCredential}
                  topicId={topicId}
                  setLoading={setLoading}
                  selectedMethod={selectedMethod}
                  credPrivateKey={credPrivateKey}
                  credPublicKey={credPublicKey}
                />
              )}
            </Accordion.Body>
          </Accordion.Item>
        )}
      </Accordion>
    </div>
  );
}

export default App;
