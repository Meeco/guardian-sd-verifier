import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createHederaClient } from "../hederaService";
import {
  deriveEdVerificationKey,
  getLocalStorage,
  setLocalStorage,
} from "../utils";

export interface AppState {
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

  const client = useMemo(() => {
    return createHederaClient(
      process.env.REACT_APP_HEDERA_ACCOUNT_ID || "",
      process.env.REACT_APP_HEDERA_PRIVATE_KEY || ""
    );
  }, []);

  const cipher = new Cipher(); // by default {version: 'recommended'}

  const appState: AppState = {
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
  };

  // store data in localstorage when they're updated
  useEffect(() => {
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
