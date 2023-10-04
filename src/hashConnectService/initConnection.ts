import { HashConnect, HashConnectTypes } from "hashconnect";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const appMetadata = {
  name: "Hedera Guardian Selective Disclosure",
  description: "Hedera Guardian Selective Disclosure",
  // TODO: upload icon for Hedera Guardian Selective Disclosure
  icon: "https://api-sandbox.svx.exchange/blobs/1f345707-447f-4273-96bd-4c135e0286d8",
};

export const initConnection = async ({
  hcInstance,
  setHashconnect,
  setHashConnectData,
  setAccountId,
  setSigner,
  setProvider,
}: {
  hcInstance: HashConnect;
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
  //initialize and use returned data
  const hashConnectData = await hcInstance.init(appMetadata, "testnet", false);
  console.log({ hashConnectData });

  if (hashConnectData.savedPairings.length > 0) {
    const accountId = hashConnectData.savedPairings[0].accountIds[0];
    setAccountId(accountId);

    const provider = hcInstance.getProvider(
      "testnet",
      hashConnectData.topic,
      accountId
    );
    setProvider(provider);

    const signer = hcInstance.getSigner(provider);
    setSigner(signer);
  }

  setHashconnect(hcInstance);
  setHashConnectData(hashConnectData);
};
