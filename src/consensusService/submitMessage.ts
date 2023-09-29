import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const submitMessage = async ({
  message,
  topicId,
  signer,
}: {
  message: string;
  signer: HashConnectSigner;
  topicId?: string;
}) => {
  try {
    const transaction = await new TopicMessageSubmitTransaction({
      topicId: topicId || undefined,
      message,
    }).freezeWithSigner(signer as unknown as Signer);

    const res = await transaction.executeWithSigner(
      signer as unknown as Signer
    );

    console.log({ res });

    // // populate adds transaction ID and node IDs to the transaction
    // const populatedTransaction = await bladeSigner.populateTransaction(
    //   transaction
    // );
    // const signedTransaction = await bladeSigner.signTransaction(
    //   populatedTransaction.freeze()
    // );

    // // call executes the transaction
    // const result = await bladeSigner.call(signedTransaction);
    // // //Request the receipt
    // const receipt = await result.getReceiptWithSigner(bladeSigner);
    // const transactionStatus = receipt.status;

    // console.log("The message transaction status: " + transactionStatus);
    console.log("Complete");
    return true;
  } catch (error) {
    console.log("Submit message failed", error);
    return false;
  }
};

export default submitMessage;
