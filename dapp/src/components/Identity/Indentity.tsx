import { ChangeEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { fetchResolveDid } from "../../didService";
import getPublicKeyHexFromJwk from "../../utils/getPublicKeyHexFromJwk";
import VerificationMethods from "./VerificationMethods";

interface IndentityProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  verifiableCredential: any;
  setVerifiableCredential: React.Dispatch<any>;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
  setCredPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  setCredPublicKey: React.Dispatch<React.SetStateAction<string>>;
}

const Indentity: React.FC<IndentityProps> = ({
  setLoading,
  verifiableCredential,
  setVerifiableCredential,
  selectedMethod,
  setSelectedMethod,
  setCredPrivateKey,
  setCredPublicKey,
}) => {
  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);

  // Get public key from user uploaded credential
  const getPublicKey = async () => {
    try {
      const { didDocument } = await fetchResolveDid(credentialDid);
      const { verificationMethod } = didDocument;
      const publicKeyJwk = verificationMethod[0].publicKeyJwk;
      const publicKeyHex = getPublicKeyHexFromJwk(publicKeyJwk);
      setCredPublicKey(publicKeyHex);
    } catch (error) {
      console.log({ error });
    }
  };

  // Get verification method from user uploaded credential
  const getVerificationMethods = async () => {
    setLoading(true);
    // Get verification method
    const { didDocument } = await fetchResolveDid(credentialDid);
    const { verificationMethod } = didDocument;
    setVerificationMethods(verificationMethod);
    // Get public key
    await getPublicKey();
    setLoading(false);
  };

  // Extract DID from user uploaded credential
  const handleExtractDid = (credential: any) => {
    if (credential) {
      const { credentialSubject } = credential;
      setCredentialDid(credentialSubject.id);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        const str: string = (e.target?.result as string) || "";
        if (str) {
          const credential = JSON.parse(str);
          handleExtractDid(credential);
          setVerifiableCredential(credential);
        }
      };
    }
  };

  const handlePrivateKeyChange = (e: ChangeEvent<any>) => {
    e.preventDefault();
    // set credential private key
    const privateKey = e.target.value;
    setCredPrivateKey(privateKey);
    // verifyCredential(privateKey);
  };

  // const verifyCredential = async (privateKey: string) => {
  //   const keyPair = await generateKeyPair({ privateKeyHex: privateKey });
  //   if (keyPair) {
  //     const { suite } = keyPair;
  //     const resultVc = await verifiable.credential.verify({
  //       credential: verifiableCredential,
  //       suite,
  //       documentLoader: documentLoader as any,
  //     });

  //     console.log({ resultVc });
  //   }
  // };

  return (
    <div>
      <div className="file">
        <Form.Label>Upload credential</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </div>
      {credentialDid ? (
        <>
          <div className="mt-4">
            <p>
              <b>DID:</b> {credentialDid}
            </p>
          </div>
          <div>
            <Button onClick={getVerificationMethods}>
              Get verification Method(s)
            </Button>
            {verificationMethods && (
              <>
                <VerificationMethods
                  selectedMethod={selectedMethod}
                  setSelectedMethod={setSelectedMethod}
                  verificationMethods={verificationMethods}
                />
                {selectedMethod && (
                  <div className="mt-4">
                    <Form.Label>Credential Private Key</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handlePrivateKeyChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Indentity;
