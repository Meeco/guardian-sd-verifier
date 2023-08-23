import * as vc from "@digitalbazaar/vc";
import { ChangeEvent, useContext, useMemo, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { fetchResolveDid } from "../../didService";
import { documentLoader, generateKeyPair } from "../../utils";
import getPublicKeyHexFromJwk from "../../utils/getPublicKeyHexFromJwk";
import { AppContext } from "../AppProvider";
import { Button as ButtonWithLoader, StatusLabel } from "../common";
import VerificationMethods from "./VerificationMethods";

const Identity = () => {
  const {
    signer,
    loading,
    setLoading,
    requesterPrivateKey,
    setCredPublicKey,
    credPrivateKey,
    setCredPrivateKey,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
  } = useContext(AppContext);

  // User uploaded file
  const [file, setFile] = useState<File | undefined>();
  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);
  const [getVerificationMethodsSuccess, setGetVerificationMethodsSuccess] =
    useState<boolean | undefined>(undefined);

  const [vcVerificaitonResult, setvcVerificaitonResult] = useState<
    boolean | undefined
  >();
  const [verifyCredentialErrMsg, setVerifyCredentialErrMsg] = useState<
    string | undefined
  >();

  const verifyStatusText = useMemo(() => {
    if (vcVerificaitonResult) {
      return "Verified";
    }
    if (vcVerificaitonResult === false)
      return verifyCredentialErrMsg ?? "VC or private key is invalid";
    else return "";
  }, [vcVerificaitonResult, verifyCredentialErrMsg]);

  const isExtractDidSuccess = useMemo(() => {
    if (file) return !!credentialDid;
    return undefined;
  }, [credentialDid, file]);

  if (!signer || !requesterPrivateKey) {
    return (
      <Accordion.Item eventKey="identity">
        <Accordion.Header>
          <b>Identity</b>
        </Accordion.Header>
        <Accordion.Body>
          <p>Please complete previous sections</p>
        </Accordion.Body>
      </Accordion.Item>
    );
  } else {
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
        setLoading({ id: "getVerificationMethods" });
        setGetVerificationMethodsSuccess(undefined);
        // Get verification method
        const { didDocument } = await fetchResolveDid(credentialDid);
        const { verificationMethod } = didDocument;
        setVerificationMethods(verificationMethod);
        // Get public key
        await getPublicKey();
        setGetVerificationMethodsSuccess(true);
        setLoading({ id: undefined });
      } catch (error) {
        setLoading({ id: undefined });
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
    };

    const verifyCredential = async () => {
      setLoading({ id: "verifyCredential" });
      try {
        const keyPair = await generateKeyPair({
          privateKeyHex: credPrivateKey,
        });
        if (keyPair) {
          const { suite } = keyPair;
          const resultVc = await vc.verifyCredential({
            credential: verifiableCredential,
            suite,
            documentLoader,
          });

          setvcVerificaitonResult(resultVc.verified);
          setLoading({ id: undefined });
        }
      } catch (error) {
        setVerifyCredentialErrMsg((error as any).message);
        setvcVerificaitonResult(false);
        setLoading({ id: undefined });
      }
    };

    return (
      <Accordion.Item eventKey="identity">
        <Accordion.Header>
          <b>Identity&nbsp;</b>
          {credentialDid ? `(${credentialDid})` : undefined}
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
              text={
                isExtractDidSuccess ? "DID Extracted" : "DID Extract Failed"
              }
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
                  <ButtonWithLoader
                    onClick={getVerificationMethods}
                    text="Get verification Method(s)"
                    loading={loading.id === "getVerificationMethods"}
                  />
                  <StatusLabel
                    isSuccess={
                      loading.id === "getVerificationMethods"
                        ? undefined
                        : getVerificationMethodsSuccess
                    }
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
                <div className="d-flex mt-3">
                  <ButtonWithLoader
                    onClick={verifyCredential}
                    text="Verify VC"
                    loading={loading.id === "verifyCredential"}
                  />
                  <StatusLabel
                    isSuccess={
                      loading.id === "verifyCredential"
                        ? undefined
                        : vcVerificaitonResult
                    }
                    text={verifyStatusText}
                  />
                </div>
              </div>
            </>
          ) : null}
        </Accordion.Body>
      </Accordion.Item>
    );
  }
};

export default Identity;
