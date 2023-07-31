import { BladeConnector, ConnectorStrategy } from "@bladelabs/blade-web3.js";

const initConnection = () => {
  const bladeConnector = new BladeConnector(
    ConnectorStrategy.WALLET_CONNECT, // preferred strategy is optional
    {
      // dApp metadata options are optional, but are highly recommended to use
      name: "Hedera Guardian Selective Disclosure",
      description: "Hedera Guardian Selective Disclosure",
      url: "https://hedera.com/guardian",
      // TODO: upload icon for Hedera Guardian Selective Disclosure
      icons: [
        "https://api-sandbox.svx.exchange/blobs/1f345707-447f-4273-96bd-4c135e0286d8",
      ],
    }
  );

  return bladeConnector;
};

export default initConnection;
