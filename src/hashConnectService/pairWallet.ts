import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

export const pairWallet = async ({
  hashconnect,
  hashConnectData,
  setAccountId,
  setSigner,
}: {
  hashconnect?: HashConnect;
  hashConnectData?: HashConnectTypes.InitilizationData;
  setAccountId: React.Dispatch<React.SetStateAction<string>>;
  setSigner: React.Dispatch<
    React.SetStateAction<HashConnectSigner | undefined>
  >;
}) => {
  if (hashconnect && hashConnectData) {
    hashconnect.foundExtensionEvent.on((walletMetadata) => {
      hashconnect.connectToLocalWallet();
    });

    hashconnect.pairingEvent.on((pairingData) => {
      setAccountId(pairingData.accountIds[0]);

      const provider = hashconnect.getProvider(
        "testnet",
        hashConnectData.topic,
        pairingData.accountIds[0]
      );

      const signer = hashconnect.getSigner(provider);
      setSigner(signer);
    });
  }
};
