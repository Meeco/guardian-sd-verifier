import { HashConnect, HashConnectTypes } from "hashconnect";

export const initHashconnect = async () => {
  const hashconnect = new HashConnect();
  const appMetadata = {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://www.hashpack.app/img/logo.svg",
  };

  const initData = await hashconnect.init(appMetadata, "testnet", false);

  return { hashconnect, initData };
};

export const pairWallet = async (
  hashConnectPromise: Promise<{
    hashconnect: HashConnect;
    initData: HashConnectTypes.InitilizationData;
  }>,
  setPairingData: (val?: HashConnectTypes.SavedPairingData) => void
) => {
  const { initData, hashconnect } = await hashConnectPromise;
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
