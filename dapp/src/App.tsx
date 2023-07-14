import { ChangeEvent, useState } from "react";
import { fetchResolveDid } from "./didService";
import { createHederaClient } from "./hederaService";
import { Loader, VerificationMethods } from "./components";
import "./App.css";

function App() {
  // Hedera's account ID
  const accountId = process.env.REACT_APP_HEDERA_ACCOUNT_ID || "";
  // Hedera's account private key
  const privateKey = process.env.REACT_APP_HEDERA_PRIVATE_KEY || "";
  // Hedera client instance
  const client = createHederaClient(accountId, privateKey);
  // Loading status
  const [loading, setLoading] = useState(false);
  // User uploaded credential
  const [credential, setCredential] = useState<any>();
  // User uploaded credential's DID
  const [verifiableCredentialDid, setVerifiableCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);
  // Topic ID for sending/receiving message
  const topicId = process.env.REACT_APP_TOPIC_ID;

  // Get verification method from user uploaded credential
  const getVerificationMethods = async () => {
    setLoading(true);
    const { didDocument } = await fetchResolveDid(verifiableCredentialDid);
    const { verificationMethod } = didDocument;
    setVerificationMethods(verificationMethod);
    setLoading(false);
  };

  // Extract DID from user uploaded credential
  const handleExtractDid = (credential: any) => {
    if (credential) {
      const { credentialSubject } = credential;
      setVerifiableCredentialDid(credentialSubject.id);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        const str: string = (e.target?.result as string) || "";
        if (str) {
          handleExtractDid(JSON.parse(str));
          setCredential(JSON.parse(str));
        }
      };
    }
  };

  return (
    <div className="App">
      {loading && <Loader />}
      <div className="file">
        <h3>Authorisation Credential</h3>
        <input
          type="file"
          name="vc-file"
          id="vc-file"
          onChange={handleFileChange}
        />
      </div>
      {verifiableCredentialDid ? (
        <>
          <div className="did">
            <p>
              <b>DID:</b> {verifiableCredentialDid}
            </p>
          </div>
          <div>
            <button onClick={getVerificationMethods}>
              Get verification Method(s)
            </button>
            {verificationMethods && (
              <VerificationMethods
                client={client}
                credential={credential}
                topicId={topicId}
                verificationMethods={verificationMethods}
                setLoading={setLoading}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default App;
