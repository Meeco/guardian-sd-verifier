import { Cipher } from "@digitalbazaar/minimal-cipher";
import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectSigner } from "hashconnect/dist/cjs/provider/signer";
import { createContext, useCallback, useEffect, useState } from "react";
import {
  deriveEdVerificationKey,
  getLocalStorage,
  setLocalStorage,
} from "../utils";

export enum NetworkType {
  testnet = "testnet",
  mainnet = "mainnet",
}

export interface AppState {
  network: NetworkType;
  setNetwork: React.Dispatch<React.SetStateAction<NetworkType>>;
  activeLoaders: string[];
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  verifiableCredential: any;
  setVerifiableCredential: React.Dispatch<any>;
  selectedMethod: any;
  setSelectedMethod: React.Dispatch<any>;
  didPublicKey: string;
  setDidPublicKey: React.Dispatch<React.SetStateAction<string>>;
  topicId?: string;
  setTopicId: React.Dispatch<React.SetStateAction<string | undefined>>;
  hashConnectData?: HashConnectTypes.InitilizationData;
  setHashConnectData: React.Dispatch<
    React.SetStateAction<HashConnectTypes.InitilizationData | undefined>
  >;
  hashconnect?: HashConnect;
  setHashconnect: React.Dispatch<React.SetStateAction<HashConnect | undefined>>;
  signer?: HashConnectSigner;
  setSigner: React.Dispatch<
    React.SetStateAction<HashConnectSigner | undefined>
  >;
  provider: any;
  setProvider: React.Dispatch<React.SetStateAction<any>>;
  accountId: string;
  setAccountId: React.Dispatch<React.SetStateAction<string>>;
  vcResponse: any;
  setVcResponse: React.Dispatch<any>;
  responders: Responder[];
  setResponders: React.Dispatch<React.SetStateAction<Responder[]>>;
  vcVerificaitonResult?: boolean;
  setvcVerificaitonResult: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  credentialDid: string;
  setCredentialDid: React.Dispatch<React.SetStateAction<string>>;
  verificationMethods: any;
  setVerificationMethods: React.Dispatch<any>;
  didPrivateKey: string;
  setDidPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  credentialVerificationKey: any;
  setCredentialVerificationKey: React.Dispatch<React.SetStateAction<any>>;
  cid: string;
  setCid: React.Dispatch<React.SetStateAction<string>>;
  cipher: any;
  presentationRequest: any;
  setPresentationRequest: React.Dispatch<any>;
}

export interface LoadingState {
  id?: string;
}

export interface Responder {
  did: string;
  accountId: string;
  encryptedKeyId: string;
  presentationResponse?: any;
}

export const AppContext = createContext({} as AppState);
AppContext.displayName = "AppContext";

const AppProvider = ({ children }: { children: JSX.Element }) => {
  // Loading status
  const [activeLoaders, setActiveLoaders] = useState<string[]>([]);

  const addLoader = useCallback(
    (id: string) => {
      setActiveLoaders([...activeLoaders, id]);
    },
    [activeLoaders]
  );

  const removeLoader = useCallback(
    (removedId: string) => {
      setActiveLoaders(activeLoaders.filter((id) => id !== removedId));
    },
    [activeLoaders]
  );

  // User uploaded credential
  const [verifiableCredential, setVerifiableCredential] = useState<any>(
    getLocalStorage("verifiableCredential")
  );
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>(
    getLocalStorage("selectedMethod")
  );
  // DID's keys
  const [didPublicKey, setDidPublicKey] = useState(
    getLocalStorage("didPublicKey") || ""
  );
  const [didPrivateKey, setDidPrivateKey] = useState(
    getLocalStorage("didPrivateKey") || ""
  );

  // User uploaded credential's DID
  const [credentialDid, setCredentialDid] = useState(
    getLocalStorage("credentialDid") || ""
  );
  // Verification methods from DID document
  const [verificationMethods, setVerificationMethods] = useState<any>(
    getLocalStorage("verificationMethods") || []
  );

  const [credentialVerificationKey, setCredentialVerificationKey] =
    useState<any>();

  const [vcVerificaitonResult, setvcVerificaitonResult] = useState<
    boolean | undefined
  >(getLocalStorage("vcVerificaitonResult") || undefined);

  const [cid, setCid] = useState(getLocalStorage("cid") || "");

  // Topic ID for sending/receiving message
  const [topicId, setTopicId] = useState<string | undefined>(
    process.env.REACT_APP_TOPIC_ID
  );

  // Wallet data
  const [hashConnectData, setHashConnectData] =
    useState<HashConnectTypes.InitilizationData>();

  const [hashconnect, setHashconnect] = useState<HashConnect>();

  const [network, setNetwork] = useState<NetworkType>(
    getLocalStorage("network") || NetworkType.testnet
  );

  const [signer, setSigner] = useState<HashConnectSigner>();

  const [provider, setProvider] = useState<any>();
  // Wallet's account ID
  const [accountId, setAccountId] = useState("");

  const [vcResponse, setVcResponse] = useState<any>(
    getLocalStorage("vcResponse")
  );

  const [presentationRequest, setPresentationRequest] = useState<any>();

  const [responders, setResponders] = useState<Responder[]>([]);

  const cipher = new Cipher(); // by default {version: 'recommended'}

  const appState: AppState = {
    hashConnectData,
    setHashConnectData,
    hashconnect,
    setHashconnect,
    signer,
    setSigner,
    provider,
    setProvider,
    activeLoaders,
    addLoader,
    removeLoader,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
    didPublicKey,
    setDidPublicKey,
    topicId,
    setTopicId,
    network,
    setNetwork,
    accountId,
    setAccountId,
    vcResponse,
    setVcResponse,
    responders,
    setResponders,
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
    cid,
    setCid,
    cipher,
    presentationRequest,
    setPresentationRequest,
  };

  // store data in localstorage when they're updated
  useEffect(() => {
    setLocalStorage("network", network);
    setLocalStorage("verifiableCredential", verifiableCredential);
    setLocalStorage("credentialDid", credentialDid);
    setLocalStorage("didPublicKey", didPublicKey);
    setLocalStorage("verificationMethods", verificationMethods);
    setLocalStorage("selectedMethod", selectedMethod);
    setLocalStorage("didPrivateKey", didPrivateKey);
    setLocalStorage("vcVerificaitonResult", vcVerificaitonResult);
    setLocalStorage("cid", cid);
    setLocalStorage("vcResponse", vcResponse);
  }, [
    didPublicKey,
    credentialDid,
    selectedMethod,
    vcVerificaitonResult,
    verifiableCredential,
    verificationMethods,
    cid,
    vcResponse,
    didPrivateKey,
    credentialVerificationKey,
    network,
  ]);

  // derive verificationKey from DID's keys
  useEffect(() => {
    if (selectedMethod && didPrivateKey && didPublicKey) {
      const { id, type } = selectedMethod;
      deriveEdVerificationKey({
        id,
        did: credentialDid,
        privateKeyHex: didPrivateKey,
        publicKeyHex: didPublicKey,
        type,
      }).then((verificationKey) => {
        setCredentialVerificationKey(verificationKey);
      });
    }
  }, [didPublicKey, credentialDid, didPrivateKey, selectedMethod]);

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

export default AppProvider;
