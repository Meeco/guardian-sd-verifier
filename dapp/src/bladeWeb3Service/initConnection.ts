import { BladeConnector, ConnectorStrategy } from "@bladelabs/blade-web3.js";

const initConnection = () => {
  const bladeConnector = new BladeConnector(
    ConnectorStrategy.WALLET_CONNECT, // preferred strategy is optional
    {
      // dApp metadata options are optional, but are highly recommended to use
      name: "Selective Disclosure DApp",
      description: "DApp description",
      url: "https://selective-disclosure-dapp.io/",
      icons: ["some-image-url.png"],
    }
  );

  return bladeConnector;
};

export default initConnection;
