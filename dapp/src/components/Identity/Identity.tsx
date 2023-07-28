import { ChangeEvent, useMemo, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { fetchResolveDid } from "../../didService";
import getPublicKeyHexFromJwk from "../../utils/getPublicKeyHexFromJwk";
import { Button, StatusLabel } from "../common";
import VerificationMethods from "./VerificationMethods";

interface IdentityProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  verifiableCredential: any;
  setVerifiableCredential: React.Dispatch<any>;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
  setCredPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  setCredPublicKey: React.Dispatch<React.SetStateAction<string>>;
}

const Identity: React.FC<IdentityProps> = ({
  loading,
  setLoading,
  verifiableCredential,
  setVerifiableCredential,
  selectedMethod,
  setSelectedMethod,
  setCredPrivateKey,
  setCredPublicKey,
}) => {
  // User uploaded file
  const [file, setFile] = useState<File | undefined>();
  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);
  const [getVerificationMethodsSuccess, setGetVerificationMethodsSuccess] =
    useState<boolean | undefined>(undefined);

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
    try {
      setLoading(true);
      setGetVerificationMethodsSuccess(undefined);
      // Get verification method
      const { didDocument } = await fetchResolveDid(credentialDid);
      const { verificationMethod } = didDocument;
      setVerificationMethods(verificationMethod);
      // Get public key
      await getPublicKey();
      setGetVerificationMethodsSuccess(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setGetVerificationMethodsSuccess(false);
      console.log({ error });
    }
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
      setFile(e.target.files[0]);
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        const str: string = (e.target?.result as string) || "";
        if (str) {
          try {
            const credential = JSON.parse(str);
            handleExtractDid(credential);
            setVerifiableCredential(credential);
          } catch (error) {
            console.log({ error });
            setCredentialDid("");
          }
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

  const isExtractDidSuccess = useMemo(() => {
    if (file) return !!credentialDid;
    return undefined;
  }, [credentialDid, file]);

  return (
    <Accordion.Item eventKey="identity">
      <Accordion.Header>
        <b>Identity </b> {credentialDid ? `(${credentialDid})` : undefined}
      </Accordion.Header>
      <Accordion.Body>
        <p>
          Set your DID, and authorisation Verifiable Credential to send your
          presentation request from.
        </p>
        <div className="d-flex mt-4">
          <Form.Control
            className="w-50"
            type="file"
            onChange={handleFileChange}
          />
          <StatusLabel
            isSuccess={isExtractDidSuccess}
            text={isExtractDidSuccess ? "DID Extracted" : "DID Extract Failed"}
          />
        </div>
        {credentialDid ? (
          <>
            <div className="mt-2">
              <p>
                <b>DID:</b> {credentialDid}
              </p>
            </div>
            <div>
              <div className="d-flex  mt-4">
                <Button
                  onClick={getVerificationMethods}
                  text=" Get verification Method(s)"
                  loading={loading}
                />
                <StatusLabel
                  isSuccess={getVerificationMethodsSuccess}
                  text={
                    getVerificationMethodsSuccess
                      ? "DID Fetched Success"
                      : "DID Fetched Failed"
                  }
                />
              </div>

              {verificationMethods.length > 0 && (
                <div className="mt-4">
                  <VerificationMethods
                    selectedMethod={selectedMethod}
                    setSelectedMethod={setSelectedMethod}
                    verificationMethods={verificationMethods}
                  />
                </div>
              )}
              <div className="mt-4">
                <Form.Label>Credential Private Key</Form.Label>
                <Form.Control
                  className="w-50"
                  type="text"
                  onChange={handlePrivateKeyChange}
                  disabled={!selectedMethod}
                />
              </div>
            </div>
          </>
        ) : null}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default Identity;
