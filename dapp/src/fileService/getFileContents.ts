import { BladeSigner } from "@bladelabs/blade-web3.js";
import { Client, FileContentsQuery, Hbar } from "@hashgraph/sdk";
import { Buffer } from "buffer";

const readFileAsJson = (text: string) => {
  return JSON.parse(text);
};

const readFileAsText = async (contents: Uint8Array) => {
  return Buffer.from(contents).toString("utf-8");
};

// TODO: execute FileContentsQuery with signer instead of Hedera client when the executeWithSigner issue is resolved'
const createHederaClient = () => {
  const client = Client.forTestnet();
  client
    .setOperator(
      process.env.REACT_APP_HEDERA_ACCOUNT_ID || "",
      process.env.REACT_APP_HEDERA_PRIVATE_KEY || ""
    )
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));
  return client;
};

const getFileContents = async (signer: BladeSigner, fileId: string) => {
  try {
    //Create the query
    const query = new FileContentsQuery().setFileId(fileId);
    const client = createHederaClient();
    // TODO: execute FileContentsQuery with signer instead of Hedera client when the executeWithSigner issue is resolved'
    const contents = await query.execute(client);
    // const contents = await query.executeWithSigner(signer);
    return readFileAsJson(await readFileAsText(contents));
  } catch (error) {
    console.log("Get file contents failed", error);
  }
};

export default getFileContents;
