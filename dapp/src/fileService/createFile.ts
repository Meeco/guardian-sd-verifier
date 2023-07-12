import { Client, FileCreateTransaction, Hbar, PrivateKey, PublicKey } from "@hashgraph/sdk";

const createFile = async (client: Client, privateKeyStr: string, publicKeyStr: string, contents: string) => {
  try {
    const publicKey = PublicKey.fromString(publicKeyStr);
    const privateKey = PrivateKey.fromString(privateKeyStr);
    //Create the transaction
    const transaction = await new FileCreateTransaction()
      .setKeys([publicKey]) //A different key then the client operator key
      .setContents(contents)
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(client);

    //Sign with the file private key
    const signTx = await transaction.sign(privateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const submitTx = await signTx.execute(client);

    //Request the receipt
    const receipt = await submitTx.getReceipt(client);

    //Get the file ID
    const { fileId } = receipt;
    return fileId;
  } catch (error) {
    console.log("Create file transaction failed", error);
  }
};

export default createFile;