import { BladeSigner } from "@bladelabs/blade-web3.js";
import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";

const submitMessage = async (
  message: string,
  bladeSigner: BladeSigner,
  topicId?: string
) => {
  try {
    const transaction = await new TopicMessageSubmitTransaction({
      topicId: topicId || undefined,
      message,
    });

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
    const transactionStatus = receipt.status;

    console.log("The message transaction status: " + transactionStatus);
    console.log("Complete");
  } catch (error) {
    console.log("Submit message failed", error);
  }
};

export default submitMessage;
