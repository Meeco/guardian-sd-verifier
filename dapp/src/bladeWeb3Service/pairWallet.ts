import { BladeConnector, HederaNetwork } from "@bladelabs/blade-web3.js";

const pairWallet = async (bladeConnector: BladeConnector) => {
  // params are optional, and Mainnet is used as a default
  const params = {
    network: HederaNetwork.Testnet,
    dAppCode: "SomeAwesomeDApp", // optional while testing, request specific one by contacting us
  };

  const pairedAccountIds = await bladeConnector.createSession(params);

  return pairedAccountIds[0];
};

export default pairWallet;
