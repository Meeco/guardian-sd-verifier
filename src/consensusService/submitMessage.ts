import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const submitMessage = async ({
  message,
  topicId,
  hcSigner,
}: {
  message: string;
  hcSigner: HashConnectSigner;
  topicId?: string;
}) => {
  try {
    const signer = hcSigner as unknown as Signer;
    const transaction = await new TopicMessageSubmitTransaction({
      topicId: topicId || undefined,
      message,
    }).freezeWithSigner(signer);

    await transaction.executeWithSigner(signer);

    return true;
  } catch (error) {
    console.log("Submit message failed", error);
    return false;
  }
};

export default submitMessage;
