import { Client, TopicCreateTransaction } from "@hashgraph/sdk";

export async function makeTopic(hederaClient: Client) {
  // Create a new topic
  let txResponse = await new TopicCreateTransaction().execute(hederaClient);
  // Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(hederaClient);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);
  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return topicId;
}
