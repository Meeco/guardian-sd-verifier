import { Buffer } from 'buffer';
import { QueryResponseMessage } from '../types';

const baseUrl = 'https://testnet.mirrornode.hedera.com';

interface Message {
  message: string;
}

interface TopicMessages {
  messages: Message[];
}

export const getResponderDid = async (topicId: string) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/topics/${topicId}/messages?encoding=base64&order=asc`, {
      headers: {
        Accept: "application/json"
      }
    });
    const data: TopicMessages = await res.json();
    const messages = data.messages.map((item) => decodeMessage(item.message));
    return messages;
  } catch (error) {
    console.log({ error });
  }
};

const decodeMessage = (value: string): QueryResponseMessage => {
  return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'));
};