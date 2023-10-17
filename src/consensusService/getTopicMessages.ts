import { Buffer } from "buffer";
import { NetworkType } from "../components/AppProvider";
import { PresentationResponseMessage, QueryResponseMessage } from "../types";

interface Message {
  message: string;
  payer_account_id: string;
}

interface TopicMessages {
  messages: Message[];
}

const getTopicMessages = async ({
  topicId,
  timeStamp,
  network,
}: {
  topicId: string;
  timeStamp: number;
  network: NetworkType;
}) => {
  try {
    const timeStampInSec = (timeStamp / 1000).toFixed(9);
    const res = await fetch(
      `https://${network}.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?encoding=base64&order=desc&timestamp=gte%3A${timeStampInSec}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data: TopicMessages = await res.json();
    const messages = data.messages.map((item) => {
      return {
        ...decodeMessage(item.message),
        payer_account_id: item.payer_account_id,
      };
    });
    return messages;
  } catch (error) {
    console.log("Get topic messages failed", error);
  }
};

const decodeMessage = (
  value: string
): QueryResponseMessage | PresentationResponseMessage => {
  return JSON.parse(Buffer.from(value, "base64").toString("utf-8"));
};

export default getTopicMessages;
