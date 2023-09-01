import { Client, Hbar } from "@hashgraph/sdk";

const createHederaClient = (accountId: string, accountPrivateKey: string) => {
  if (!accountPrivateKey || !accountPrivateKey.length) {
    throw new Error("Missing private key - check your .env file");
  }
  const client = Client.forTestnet();
  client
    .setOperator(accountId, accountPrivateKey)
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));

  return client;
};

export default createHederaClient;
