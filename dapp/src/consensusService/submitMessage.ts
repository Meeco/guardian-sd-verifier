import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

export const submitMessage = async (
  message: string,
  client: Client,
  topicId?: string
) => {
  const sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId || undefined,
    message,
  }).execute(client);

  const getReceipt = await sendResponse.getReceipt(client);
  const transactionStatus = getReceipt.status;

  console.log(
    "The message transaction status: " + transactionStatus.toString()
  );
  console.log("Complete");
};
