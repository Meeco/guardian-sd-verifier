import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import { Ed25519KeyPair } from "@transmute/did-key-ed25519";
import { createContext, useMemo, useState } from "react";
import { createHederaClient } from "../hederaService";
import { RequesterPrivateKey } from "../utils";

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
  requesterPrivateKey?: RequesterPrivateKey;
  setRequesterPrivateKey: React.Dispatch<
    React.SetStateAction<RequesterPrivateKey | undefined>
  >;
  vcFile: any;
  setVcFile: React.Dispatch<any>;
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
  const [verifiableCredential, setVerifiableCredential] = useState<any>();
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>();
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
  const [accountId, setaccountId] = useState("");
  // Requester(wallet holder)'s private key
  const [requesterPrivateKey, setRequesterPrivateKey] = useState<
    RequesterPrivateKey | undefined
  >();
  const [vcFile, setVcFile] = useState<any>();

  const [responders, setResponders] = useState<Responder[]>([]);

  const [credentialKey, setCredentialKey] = useState<
    CredentialKey | undefined
  >();

  const [vcVerificaitonResult, setvcVerificaitonResult] = useState<
    boolean | undefined
  >();

  const client = useMemo(() => {
    if (requesterPrivateKey) {
      const requesterPrivateKeyStr = requesterPrivateKey?.privateKeyStr;
      return createHederaClient(accountId, requesterPrivateKeyStr);
    }
  }, [accountId, requesterPrivateKey]);

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
    requesterPrivateKey,
    setRequesterPrivateKey,
    vcFile,
    setVcFile,
    responders,
    setResponders,
    client,
    credentialKey,
    setCredentialKey,
    vcVerificaitonResult,
    setvcVerificaitonResult,
    cipher,
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

export default AppProvider;
