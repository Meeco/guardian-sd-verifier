import { ChangeEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { fetchResolveDid } from "../../didService";
import VerificationMethods from "./VerificationMethods";

interface IndentityProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCredential: React.Dispatch<any>;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
}

const Indentity: React.FC<IndentityProps> = ({
  setLoading,
  setCredential,
  selectedMethod,
  setSelectedMethod,
}) => {
  // User uploaded credential's DID
  const [verifiableCredentialDid, setVerifiableCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);

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
    <div>
      <div className="file">
        <Form.Label>Upload credential</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </div>
      {verifiableCredentialDid ? (
        <>
          <div className="mt-4">
            <p>
              <b>DID:</b> {verifiableCredentialDid}
            </p>
          </div>
          <div>
            <Button onClick={getVerificationMethods}>
              Get verification Method(s)
            </Button>
            {verificationMethods && (
              <VerificationMethods
                selectedMethod={selectedMethod}
                setSelectedMethod={setSelectedMethod}
                verificationMethods={verificationMethods}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Indentity;
