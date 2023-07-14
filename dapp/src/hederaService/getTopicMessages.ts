import { Buffer } from "buffer";
import { QueryResponseMessage, PresentationResponseMessage } from "../types";

interface Message {
  message: string;
}

interface TopicMessages {
  messages: Message[];
}

const getTopicMessages = async (topicId: string) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_MIRROR_NODE_URL}/api/v1/topics/${topicId}/messages?encoding=base64&order=asc`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data: TopicMessages = await res.json();
    const messages = data.messages.map((item) => decodeMessage(item.message));
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
