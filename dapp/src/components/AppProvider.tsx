import { BladeConnector, BladeSigner } from "@bladelabs/blade-web3.js";
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
  credPrivateKey: string;
  setCredPrivateKey: React.Dispatch<React.SetStateAction<string>>;
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
  responders: Responders[];
  setResponders: React.Dispatch<React.SetStateAction<Responders[]>>;
  client: any;
}

export interface LoadingState {
  id?: string;
}

export interface Responders {
  did: string;
  publicKey: string;
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
  // Credential's private key
  const [credPrivateKey, setCredPrivateKey] = useState("");
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
  const [responders, setResponders] = useState<Responders[]>([]);

  const client = useMemo(() => {
    if (requesterPrivateKey) {
      const requesterPrivateKeyStr = requesterPrivateKey?.privateKeyStr;
      return createHederaClient(accountId, requesterPrivateKeyStr);
    }
  }, [accountId, requesterPrivateKey]);

  const appState: AppState = {
    loading,
    setLoading,
    verifiableCredential,
    setVerifiableCredential,
    selectedMethod,
    setSelectedMethod,
    credPrivateKey,
    setCredPrivateKey,
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
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};

export default AppProvider;
