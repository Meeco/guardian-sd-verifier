import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import "./App.css";
import initConnection from "./bladeWeb3Service/initConnection";
import pairWallet from "./bladeWeb3Service/pairWallet";
import {
  DisclosureRequest,
  HederaAccount,
  Identity,
  VcQuery,
} from "./components";

export interface LoadingState {
  id?: string;
}

function App() {
  // Loading status
  const [loading, setLoading] = useState<LoadingState>({
    id: undefined,
  });
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
  const [vcFile, setVcFile] = useState<any>();
  const [responderDids, setResponderDids] = useState<string[]>([]);

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
      <Accordion className="mt-4" defaultActiveKey="account">
        <HederaAccount
          handleConnectWallet={handleConnectWallet}
          signer={signer}
          accountID={accountID}
        />
        <Identity
          loading={loading}
          setLoading={setLoading}
          setVerifiableCredential={setVerifiableCredential}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          setCredPrivateKey={setCredPrivateKey}
          setCredPublicKey={setCredPublicKey}
        />
        <VcQuery
          signer={signer}
          topicId={topicId}
          loading={loading}
          setLoading={setLoading}
          credPrivateKey={credPrivateKey}
          setVcFile={setVcFile}
          responderDids={responderDids}
          setResponderDids={setResponderDids}
        />
        <DisclosureRequest
          signer={signer}
          topicId={topicId}
          loading={loading}
          setLoading={setLoading}
          verifiableCredential={verifiableCredential}
          selectedMethod={selectedMethod}
          credPrivateKey={credPrivateKey}
          vcFile={vcFile}
          responderDids={responderDids}
        />
      </Accordion>
    </div>
  );
}

export default App;
