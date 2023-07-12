import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";

export let hashconnect: HashConnect;
export let initData: HashConnectTypes.InitilizationData;

export const initHashconnect = async () => {
  const hashconnectInstance = new HashConnect();
  const appMetadata = {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://www.hashpack.app/img/logo.svg",
  };

  const data = await hashconnectInstance.init(appMetadata, "testnet", false);
  initData = data;
  hashconnect = hashconnectInstance;

  return initData;
};

export const pairWallet = async (
  setPairingData: (val?: HashConnectTypes.SavedPairingData) => void
) => {
  if (initData) hashconnect.connectToLocalWallet();

  hashconnect.foundExtensionEvent.once((walletMetadata) => {
    //do something with metadata
  });

  hashconnect.pairingEvent.on((data) => {
    const { pairingData } = data;
    setPairingData(pairingData);
  });

  return initData;
};

export const sendTransaction = async (
  trans: Uint8Array,
  acctToSign: string,
  return_trans: boolean = false,
  hideNfts: boolean = false,
  getRecord: boolean = false
) => {
  const { topic } = initData;
  const transaction: MessageTypes.Transaction = {
    topic: topic,
    byteArray: trans,

    metadata: {
      accountToSign: acctToSign,
      returnTransaction: return_trans,
      hideNft: hideNfts,
      getRecord: getRecord,
    },
  };

  return await hashconnect.sendTransaction(topic, transaction);
};
