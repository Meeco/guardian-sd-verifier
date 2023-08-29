import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import { Ed25519KeyPair } from "@transmute/did-key-ed25519";
import { createContext, useEffect, useMemo, useState } from "react";
import { createHederaClient } from "../hederaService";
import {
  generateCredentialKey,
  getLocalStorage,
  setLocalStorage,
} from "../utils";

export interface AppState {
  loading: LoadingState;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  verifiableCredential: any;
  setVerifiableCredential: React.Dispatch<any>;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
  credPublicKey: string;
  setCredPublicKey: React.Dispatch<React.SetStateAction<string>>;
  topicId?: string;
  bladeConnector: any;
  setBladeConnector: React.Dispatch<any>;
  signer: BladeSigner | null;
  setSigner: React.Dispatch<React.SetStateAction<BladeSigner | null>>;
  accountId: string;
  setaccountId: React.Dispatch<React.SetStateAction<string>>;
  vcResponse: any;
  setVcResponse: React.Dispatch<any>;
  responders: Responder[];
  setResponders: React.Dispatch<React.SetStateAction<Responder[]>>;
  client: any;
  credentialKey?: CredentialKey;
  setCredentialKey: React.Dispatch<
    React.SetStateAction<CredentialKey | undefined>
  >;
  vcVerificaitonResult?: boolean;
  setvcVerificaitonResult: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  credentialDid: string;
  setCredentialDid: React.Dispatch<React.SetStateAction<string>>;
  verificationMethods: any;
  setVerificationMethods: React.Dispatch<any>;
  credentialPrivateKey: string;
  setCredentialPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  cid: string;
  setCid: React.Dispatch<React.SetStateAction<string>>;
  cipher: any;
}

export interface LoadingState {
  id?: string;
}

export interface Responder {
  did: string;
  accountId: string;
  encyptedKeyId: string;
  presentationResponse?: any;
}

export interface CredentialKey {
  keyPair: Ed25519KeyPair;
  verificationKey: any;
  suite: any;
}

export const AppContext = createContext({} as AppState);
AppContext.displayName = "AppContext";

const AppProvider = ({ children }: { children: JSX.Element }) => {
  // Loading status
  const [loading, setLoading] = useState<LoadingState>({
    id: undefined,
  });
  // User uploaded credential
  const [verifiableCredential, setVerifiableCredential] = useState<any>(
    getLocalStorage("verifiableCredential")
  );
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>(
    getLocalStorage("selectedMethod")
  );
  // Credential's public key
  const [credPublicKey, setCredPublicKey] = useState(
    getLocalStorage("credPublicKey") || ""
  );
  // Topic ID for sending/receiving message
  const topicId = process.env.REACT_APP_TOPIC_ID;
  // Blade wallet connector
  const [bladeConnector, setBladeConnector] = useState<
    BladeConnector | undefined
  >();
  // Blade wallet signer(user)
  const [signer, setSigner] = useState<BladeSigner | null>(null);
  // Blade wallet account ID
  const [accountId, setaccountId] = useState("");

  const [vcResponse, setVcResponse] = useState<any>(
    getLocalStorage("vcResponse")
  );

  const [responders, setResponders] = useState<Responder[]>([]);

  const [credentialKey, setCredentialKey] = useState<
    CredentialKey | undefined
  >();

  const [credentialPrivateKey, setCredentialPrivateKey] = useState(
    getLocalStorage("credentialPrivateKey") || ""
  );

  const [vcVerificaitonResult, setvcVerificaitonResult] = useState<
    boolean | undefined
  >(getLocalStorage("vcVerificaitonResult") || undefined);

  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState(
    getLocalStorage("credentialDid") || ""
  );
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>(
    getLocalStorage("verificationMethods") || []
  );

  const [cid, setCid] = useState(getLocalStorage("cid") || "");

  const client = useMemo(() => {
    return createHederaClient(
      process.env.REACT_APP_HEDERA_ACCOUNT_ID || "",
      process.env.REACT_APP_HEDERA_PRIVATE_KEY || ""
    );
  }, []);

  const cipher = new Cipher(); // by default {version: 'recommended'}

  const appState: AppState = {
    loading,
    setLoading,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
    credPublicKey,
    setCredPublicKey,
    topicId,
    bladeConnector,
    setBladeConnector,
    signer,
    setSigner,
    accountId,
    setaccountId,
    vcResponse,
    setVcResponse,
    responders,
    setResponders,
    client,
    credentialKey,
    setCredentialKey,
    vcVerificaitonResult,
    setvcVerificaitonResult,
    credentialDid,
    setCredentialDid,
    verificationMethods,
    setVerificationMethods,
    credentialPrivateKey,
    setCredentialPrivateKey,
    cid,
    setCid,
    cipher,
  };

  useEffect(() => {
    setLocalStorage("verifiableCredential", verifiableCredential);
    setLocalStorage("credentialDid", credentialDid);
    setLocalStorage("credPublicKey", credPublicKey);
    setLocalStorage("verificationMethods", verificationMethods);
    setLocalStorage("selectedMethod", selectedMethod);
    setLocalStorage("credentialPrivateKey", credentialPrivateKey);
    setLocalStorage("vcVerificaitonResult", vcVerificaitonResult);
    setLocalStorage("cid", cid);
    setLocalStorage("vcResponse", vcResponse);
  }, [
    credPublicKey,
    credentialDid,
    selectedMethod,
    vcVerificaitonResult,
    verifiableCredential,
    verificationMethods,
    credentialKey,
    credentialPrivateKey,
    cid,
    vcResponse,
  ]);

  useEffect(() => {
    if (credentialPrivateKey) {
      generateCredentialKey({
        privateKeyHex: credentialPrivateKey,
      }).then((credentialKey) => setCredentialKey(credentialKey));
    }
  }, [credentialPrivateKey]);

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

export default AppProvider;
