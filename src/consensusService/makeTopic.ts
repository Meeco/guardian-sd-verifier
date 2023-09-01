import { Client, Hbar, TopicCreateTransaction } from "@hashgraph/sdk";

const client = Client.forTestnet();
const accountId = process.env.REACT_APP_HEDERA_ACCOUNT_ID || "";
const accountPrivateKey = process.env.REACT_APP_HEDERA_PRIVATE_KEY || "";
client
  .setOperator(accountId, accountPrivateKey)
  .setDefaultMaxTransactionFee(new Hbar(1))
  .setMaxQueryPayment(new Hbar(1));

const makeTopic = async () => {
  try {
    // Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);
    // Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);
    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return topicId;
  } catch (error) {
    console.log("Make topic failed", error);
  }
};

export default makeTopic;
