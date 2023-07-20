import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileCreateTransaction, Hbar } from "@hashgraph/sdk";

const createFile = async (bladeSigner: BladeSigner, contents: string) => {
  try {
    //Create the transaction
    const transaction = await new FileCreateTransaction()
      .setContents(contents)
      .setMaxTransactionFee(new Hbar(2));

    // populate adds transaction ID and node IDs to the transaction
    const populatedTransaction = await bladeSigner.populateTransaction(
      transaction
    );
    const signedTransaction = await bladeSigner.signTransaction(
      populatedTransaction.freeze()
    );

    // call executes the transaction
    const result = await bladeSigner.call(signedTransaction);

    // //Request the receipt
    const receipt = await result.getReceiptWithSigner(bladeSigner);
    const { fileId } = receipt;
    return fileId;
  } catch (error) {
    console.log("Create file transaction failed", error);
  }
};

export default createFile;
