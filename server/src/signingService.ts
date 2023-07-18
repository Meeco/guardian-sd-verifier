import {
  Client,
  PrivateKey,
  HbarUnit,
  TransferTransaction,
  Transaction,
  AccountId,
  Hbar,
  TransactionId,
  PublicKey,
  FileCreateTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { config } from "dotenv";

export const initSigningService = (accountId: string, privateKey: string) => {
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);
};

export const signAndMakeBytes = async (
  privateKey: string,
  signingAcctId: string
) => {
  const privKey = PrivateKey.fromString(privateKey);
  const pubKey = privKey.publicKey;

  let nodeId = [new AccountId(3)];
  let transId = TransactionId.generate(signingAcctId);

  let trans = new FileCreateTransaction();

  trans.setNodeAccountIds(nodeId);
  trans.setTransactionId(transId);

  trans = await trans.freeze();

  let transBytes = trans.toBytes();

  const sig = await privKey.signTransaction(
    Transaction.fromBytes(transBytes) as any
  );

  const out = trans.addSignature(pubKey, sig);
  const outBytes = out.toBytes();

  return outBytes;
};
