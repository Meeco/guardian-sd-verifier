import * as vc from "@digitalbazaar/vc";
import { ChangeEvent, useContext, useMemo, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { EventKey } from "../../constants";
import { fetchResolveDid } from "../../didService";
import { documentLoader, generateCredentialKey } from "../../utils";
import getPublicKeyHexFromJwk from "../../utils/getPublicKeyHexFromJwk";
import { AppContext } from "../AppProvider";
import {
  AccordianToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../common";
import VerificationMethods from "./VerificationMethods";

const Identity = () => {
  const {
    signer,
    loading,
    setLoading,
    requesterPrivateKey,
    credPublicKey,
    setCredPublicKey,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
    credentialKey,
    setCredentialKey,
    vcVerificaitonResult,
    setvcVerificaitonResult,
  } = useContext(AppContext);

  // User uploaded file
  const [file, setFile] = useState<File | undefined>();
  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState("");
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>([]);

  const [getVerificationMethodsSuccess, setGetVerificationMethodsSuccess] =
    useState<boolean | undefined>(undefined);

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
      <Accordion.Item eventKey={EventKey.Identity}>
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
        const didDocument = await fetchResolveDid(credentialDid);
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
        const didDocument = await fetchResolveDid(credentialDid);
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

    const handlePrivateKeyChange = async (e: ChangeEvent<any>) => {
      e.preventDefault();
      // set credential private key
      const privateKey = e.target.value;
      if (privateKey.length === 64) {
        try {
          const credentialKey = await generateCredentialKey({
            privateKeyHex: privateKey,
          });

          const { keyPair } = credentialKey;
          const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex");

          if (credPublicKey === publicKeyHex) {
            setCredentialKey(credentialKey);
            setvcVerificaitonResult(undefined);
          } else {
            setCredentialKey(undefined);
            setVerifyCredentialErrMsg("Incorrect private key");
            setvcVerificaitonResult(false);
          }
        } catch (error) {
          setCredentialKey(undefined);
          setVerifyCredentialErrMsg((error as any).message);
          setvcVerificaitonResult(false);
        }
      } else if (!privateKey) {
        setCredentialKey(undefined);
        setvcVerificaitonResult(undefined);
      } else {
        setCredentialKey(undefined);
        setVerifyCredentialErrMsg(
          "Credential Private Key's length should be 64"
        );
        setvcVerificaitonResult(false);
      }
    };

    const verifyCredential = async () => {
      setLoading({ id: "verifyCredential" });
      try {
        if (credentialKey) {
          const { suite } = credentialKey;
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
      <Accordion.Item eventKey={EventKey.Identity}>
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
                  {vcVerificaitonResult ? (
                    <>
                      <AccordianToggleButton
                        text="Next"
                        eventKey={EventKey.VcQuery}
                        isSuccess={
                          loading.id === "verifyCredential"
                            ? undefined
                            : vcVerificaitonResult
                        }
                        statusText={verifyStatusText}
                      />
                    </>
                  ) : (
                    <>
                      <ButtonWithLoader
                        onClick={verifyCredential}
                        text="Verify VC"
                        loading={loading.id === "verifyCredential"}
                        disabled={!credentialKey}
                      />
                      <StatusLabel
                        isSuccess={
                          loading.id === "verifyCredential"
                            ? undefined
                            : vcVerificaitonResult
                        }
                        text={verifyStatusText}
                      />
                    </>
                  )}
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
