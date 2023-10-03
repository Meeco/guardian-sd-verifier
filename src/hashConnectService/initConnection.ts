import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const appMetadata = {
  name: "Hedera Guardian Selective Disclosure",
  description: "Hedera Guardian Selective Disclosure",
  // TODO: upload icon for Hedera Guardian Selective Disclosure
  icon: "https://api-sandbox.svx.exchange/blobs/1f345707-447f-4273-96bd-4c135e0286d8",
};

export const initConnection = async ({
  setHashconnect,
  setHashConnectData,
  setAccountId,
  setSigner,
  setProvider,
}: {
  setHashconnect: React.Dispatch<React.SetStateAction<HashConnect | undefined>>;
  setHashConnectData: React.Dispatch<
    React.SetStateAction<HashConnectTypes.InitilizationData | undefined>
  >;
  setAccountId: React.Dispatch<React.SetStateAction<string>>;
  setSigner: React.Dispatch<
    React.SetStateAction<HashConnectSigner | undefined>
  >;
  setProvider: React.Dispatch<React.SetStateAction<any>>;
}) => {
  //create the hashconnect instance
  const hashconnect = new HashConnect();
  //initialize and use returned data
  const hashConnectData = await hashconnect.init(appMetadata, "testnet", false);

  if (hashConnectData.savedPairings.length > 0) {
    const accountId = hashConnectData.savedPairings[0].accountIds[0];
    setAccountId(accountId);

    const provider = hashconnect.getProvider(
      "testnet",
      hashConnectData.topic,
      accountId
    );
    setProvider(provider);

    const signer = hashconnect.getSigner(provider);
    setSigner(signer);
  }

  setHashconnect(hashconnect);
  setHashConnectData(hashConnectData);
};
