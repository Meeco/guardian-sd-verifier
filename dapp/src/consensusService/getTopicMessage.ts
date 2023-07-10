import {
  Client,
  Timestamp,
  TopicMessage,
  TopicMessageQuery,
} from "@hashgraph/sdk";

export interface DecodedMessage {
  consensusTimestamp: Timestamp;
  sequenceNumber: Long;
  topicId: string;
  contents: { [key: string]: any };
}

export const getTopicMessage = (client: Client, topicId: string) => {
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      console.log({ message });
    });
};

// const handleMessage = (message: TopicMessage, topicId?: string) => {
//   const decoded = fromTopicMessage(message, topicId);
//   if (!decoded) {
//     return;
//   }
//   console.log({ decoded });
//   return decoded;
// };

// const decodeBase64Json = (value: string | Uint8Array): any =>
//   JSON.parse(Buffer.from(value as any, "base64").toString("utf-8"));

// const fromTopicMessage = (
//   message: TopicMessage,
//   topicId?: string
// ): DecodedMessage | null => {
//   try {
//     const contents = decodeBase64Json(message.contents);

//     return {
//       consensusTimestamp: message.consensusTimestamp,
//       sequenceNumber: message.sequenceNumber,
//       topicId: topicId || "",
//       contents,
//     };
//   } catch (error) {
//     console.log(
//       `Failed to decode message "${message.sequenceNumber}" as JSON - it will be ignored`,
//       error
//     );
//   }

//   return null;
// };
