import { Client } from "@hashgraph/sdk";
import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import "./App.css";
import { Indentity, Loader, Request, WalletInfo } from "./components";
import { createHederaClient } from "./hederaService";

function App() {
  // Loading status
  const [loading, setLoading] = useState(false);
  // User uploaded credential
  const [credential, setCredential] = useState<any>();
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>();
  // User's account ID
  const [accountId, setAccountId] = useState("");
  // User's private key
  const [privateKey, setPrivateKey] = useState("");
  // Hedera client
  const [client, setClient] = useState<Client | undefined>();
  // Credential's private key
  const [credPrivateKey, setCredPrivateKey] = useState("");
  // Credential's public key
  const [credPublicKey, setCredPublicKey] = useState("");
  // Topic ID for sending/receiving message
  const topicId = process.env.REACT_APP_TOPIC_ID;

  useEffect(() => {
    if (accountId && privateKey) {
      const client = createHederaClient(accountId, privateKey);
      setClient(client);
    }
  }, [accountId, privateKey]);

  return (
    <div className="App">
      {loading && <Loader />}
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
        <Accordion.Item eventKey="wallet">
          <Accordion.Header>Hedera Wallet</Accordion.Header>
          <Accordion.Body>
            <WalletInfo
              setAccountId={setAccountId}
              setPrivateKey={setPrivateKey}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="request">
          <Accordion.Header>Request</Accordion.Header>
          <Accordion.Body>
            {client ? (
              <Request
                client={client}
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
