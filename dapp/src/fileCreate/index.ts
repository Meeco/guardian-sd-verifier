import { TransactionReceipt } from "@hashgraph/sdk";
import { sendTransaction } from "../hashConnect";
import getTransactionBytesString from "./getTransactionBytesString";

const buildCreateFileTransaction = async () => {
  let transactionBytes: Uint8Array = await getTransactionBytesString();

  let res = await sendTransaction(
    transactionBytes,
    process.env.MY_ACCOUNT_ID || ""
  );

  //handle response
  let responseData: any = {
    response: res,
    receipt: null,
  };

  if (res.success)
    responseData.receipt = TransactionReceipt.fromBytes(
      res.receipt as Uint8Array
    );

  console.log({ responseData });
};

export default buildCreateFileTransaction;
