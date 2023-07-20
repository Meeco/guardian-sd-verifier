import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { useEffect, useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import "./App.css";
import initConnection from "./bladeWeb3Service/initConnection";
import pairWallet from "./bladeWeb3Service/pairWallet";
import { Indentity, Loader, Request } from "./components";

function App() {
  // Loading status
  const [loading, setLoading] = useState(false);
  // User uploaded credential
  const [credential, setCredential] = useState<any>();
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

  console.log({ bladeConnector });

  const handleConnectWallet = () => {
    if (bladeConnector) {
      pairWallet(bladeConnector).then(() => {
        const signer = bladeConnector.getSigner();
        if (signer) {
          setSigner(signer);
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
      {loading && <Loader />}
      <div>
        <Button onClick={handleConnectWallet}>connect wallet</Button>
      </div>
      <Accordion defaultActiveKey="identity">
        <Accordion.Item eventKey="identity">
          <Accordion.Header>Identity</Accordion.Header>
          <Accordion.Body>
            <Indentity
              setLoading={setLoading}
              setCredential={setCredential}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
              setCredPrivateKey={setCredPrivateKey}
              setCredPublicKey={setCredPublicKey}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="request">
          <Accordion.Header>Request</Accordion.Header>
          <Accordion.Body>
            {signer ? (
              <Request
                signer={signer}
                credential={credential}
                topicId={topicId}
                setLoading={setLoading}
                selectedMethod={selectedMethod}
                credPrivateKey={credPrivateKey}
                credPublicKey={credPublicKey}
              />
            ) : (
              <>
                <p>Please enter wallet info first</p>
              </>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default App;
