import { Ed25519Signature2018 } from "@transmute/ed25519-signature-2018";
import { Ed25519Signature2020 } from "@transmute/ed25519-signature-2020";
import { verifiable } from "@transmute/vc.js";
import { DocumentLoader } from "@transmute/vc.js/dist/types/DocumentLoader";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Accordion, Form, InputGroup } from "react-bootstrap";
import { EyeFill, EyeSlash } from "react-bootstrap-icons";
import { EventKey } from "../../constants";
import { fetchResolveDid } from "../../didService";
import { documentLoader } from "../../utils";
import deriveEdVerificationKey from "../../utils/deriveEdVerificationKey";
import derivePublicKeyHexFromJwk from "../../utils/derivePublicKeyHexFromJwk";
import { AppContext } from "../AppProvider";
import {
  AccordionToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../common";
import VerificationMethods from "./VerificationMethods";

const Identity = () => {
  const {
    activeLoaders,
    addLoader,
    removeLoader,
    didPublicKey,
    setDidPublicKey,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
    vcVerificaitonResult,
    setvcVerificaitonResult,
    credentialDid,
    setCredentialDid,
    verificationMethods,
    setVerificationMethods,
    didPrivateKey,
    setDidPrivateKey,
    credentialVerificationKey,
    setCredentialVerificationKey,
  } = useContext(AppContext);

  const [displayedKey, setDisplayedKey] = useState(didPrivateKey);
  const [isRevealed, setIsRevealed] = useState(false);

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
      return (
        `${verifyCredentialErrMsg}, please try again` ??
        "VC or private key is invalid"
      );
    else return "";
  }, [vcVerificaitonResult, verifyCredentialErrMsg]);

  const isExtractDidSuccess = useMemo(() => {
    if (credentialDid) return !!credentialDid;
    return undefined;
  }, [credentialDid]);

  // Get public key from user uploaded credential
  const getPublicKey = useCallback(
    (selectedMethod: any) => {
      try {
        const { type, publicKeyJwk } = selectedMethod;
        switch (type) {
          case "Ed25519VerificationKey2018":
            if (publicKeyJwk) {
              setDidPublicKey(derivePublicKeyHexFromJwk(publicKeyJwk));
            } else {
              setDidPublicKey(
                Buffer.from(
                  bs58.decode(selectedMethod.publicKeyBase58)
                ).toString("hex")
              );
            }
            break;
          case "JsonWebKey2020":
            setDidPublicKey(derivePublicKeyHexFromJwk(publicKeyJwk));
            break;
          case "Ed25519VerificationKey2020":
            setDidPublicKey(
              Buffer.from(
                base58btc.decode(selectedMethod.publicKeyMultibase)
              ).toString("hex")
            );
            break;
          default:
            break;
        }
      } catch (error) {
        console.log({ error });
      }
    },
    [setDidPublicKey]
  );

  // Get verification method from user uploaded credential
  const getVerificationMethods = async () => {
    try {
      addLoader("getVerificationMethods");
      setGetVerificationMethodsSuccess(undefined);
      // Get verification method
      const didDocument = await fetchResolveDid(credentialDid);
      const { verificationMethod } = didDocument;
      setVerificationMethods(verificationMethod);
      // Get public key
      // await getPublicKey();
      setGetVerificationMethodsSuccess(true);
      removeLoader("getVerificationMethods");
    } catch (error) {
      removeLoader("getVerificationMethods");
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
    const privateKeyHex = e.target.value as string;
    setDisplayedKey(privateKeyHex);

    if (privateKeyHex.length === 128 || privateKeyHex.length === 132) {
      try {
        const verificationKey = await deriveEdVerificationKey({
          id: selectedMethod.id,
          did: credentialDid,
          privateKeyHex,
          publicKeyHex: didPublicKey,
          type: selectedMethod.type,
        });

        const { publicKeyMultibase } = verificationKey.export({
          publicKey: true,
        });

        const verificationPublicKeyHex = Buffer.from(
          base58btc.decode(publicKeyMultibase)
        ).toString("hex");

        // Use includes as a 2018 key has a header that will be stripped off
        // resulting in a slightly different key
        if (verificationPublicKeyHex.includes(didPublicKey)) {
          setDidPrivateKey(privateKeyHex);
          setCredentialVerificationKey(verificationKey);
          setvcVerificaitonResult(undefined);
          setVerifyCredentialErrMsg("");
        } else {
          setDidPrivateKey("");
          setCredentialVerificationKey(undefined);
          setVerifyCredentialErrMsg("Incorrect private key");
          setvcVerificaitonResult(false);
        }
      } catch (error) {
        setDidPrivateKey("");
        setCredentialVerificationKey(undefined);
        setVerifyCredentialErrMsg((error as any).message);
        setvcVerificaitonResult(false);
      }
    } else if (privateKeyHex === "") {
      setCredentialVerificationKey(undefined);
      setvcVerificaitonResult(undefined);
    } else {
      setDidPrivateKey("");
      setCredentialVerificationKey(undefined);
      setVerifyCredentialErrMsg(
        "Credential Private Key's length should be 128 or 132"
      );
      setvcVerificaitonResult(false);
    }
  };

  const verifyCredential = async () => {
    addLoader("verifyCredential");
    try {
      let suiteType;
      switch (verifiableCredential.proof?.type) {
        case "Ed25519Signature2018":
          suiteType = Ed25519Signature2018;
          break;
        case "Ed25519Signature2020":
          suiteType = Ed25519Signature2020;
          break;
        default:
          throw new Error(
            `Unsupported proof suite "${verifiableCredential.proof?.suite}"`
          );
      }

      const suite = new suiteType({});

      const resultVc = await verifiable.credential.verify({
        credential: verifiableCredential,
        documentLoader: documentLoader as DocumentLoader,
        suite,
      });

      setvcVerificaitonResult(resultVc.verified);
      removeLoader("verifyCredential");
    } catch (error) {
      setVerifyCredentialErrMsg((error as any).message);
      setvcVerificaitonResult(false);
      removeLoader("verifyCredential");
    }
  };

  const handlePasswordReveal = () => {
    setIsRevealed((prev) => !prev);
  };

  useEffect(() => {
    if (selectedMethod) {
      getPublicKey(selectedMethod);
    }
  }, [getPublicKey, selectedMethod]);

  return (
    <Accordion.Item eventKey={EventKey.Identity}>
      <Accordion.Header>
        <b>Identity&nbsp;</b>
        {credentialDid ? `(${credentialDid})` : undefined}
      </Accordion.Header>
      <Accordion.Body>
        <p className="fst-italic">
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
                <ButtonWithLoader
                  onClick={getVerificationMethods}
                  text="Get verification Method(s)"
                  loading={activeLoaders.includes("getVerificationMethods")}
                />
                <StatusLabel
                  isSuccess={
                    activeLoaders.includes("getVerificationMethods")
                      ? undefined
                      : getVerificationMethodsSuccess
                  }
                  text={
                    getVerificationMethodsSuccess
                      ? "DID Fetched Success"
                      : "DID Fetched Failed, please try again"
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
                <Form.Label>DID Private Key (Hex)</Form.Label>
                <InputGroup className="w-50">
                  <Form.Control
                    type={isRevealed ? "text" : "password"}
                    onChange={handlePrivateKeyChange}
                    disabled={!selectedMethod}
                    value={displayedKey}
                  />
                  <InputGroup.Text>
                    <i onClick={handlePasswordReveal}>
                      {isRevealed ? <EyeSlash /> : <EyeFill />}
                    </i>
                  </InputGroup.Text>
                </InputGroup>
              </div>
              <div className="d-flex mt-3">
                {vcVerificaitonResult ? (
                  <>
                    <AccordionToggleButton
                      text="Next"
                      eventKey={EventKey.VCAndPresentationDefinition}
                      isSuccess={
                        activeLoaders.includes("verifyCredential")
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
                      loading={activeLoaders.includes("verifyCredential")}
                      disabled={!credentialVerificationKey}
                    />
                    <StatusLabel
                      isSuccess={
                        activeLoaders.includes("verifyCredential")
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
};

export default Identity;
