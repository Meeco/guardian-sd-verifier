import { getTopicMessages } from "../../consensusService";
import { MessageType, PresentationResponseMessage } from "../../types";
import { pollRequest } from "../../utils";
import { NetworkType } from "../AppProvider";

export const handlePollPresentationResponseRequest = async ({
  requestId,
  topicId,
  timeStamp,
  network,
  pollTimeout = 60000,
  pollInterval,
}: {
  requestId: string;
  topicId?: string;
  timeStamp: number;
  network: NetworkType;
  pollTimeout?: number;
  pollInterval?: number;
}) => {
  const presentationResponseMessage = await pollRequest(
    async () => {
      // Get presentation response from mirror node
      const topicMessages = (await getTopicMessages({
        topicId: topicId || "",
        timeStamp,
        network,
      })) as PresentationResponseMessage[];

      const message = topicMessages?.filter(
        (msg) =>
          msg.request_id === requestId &&
          msg.operation === MessageType.PRESENTATION_RESPONSE
      )[0];

      return message;
    },
    pollTimeout,
    pollInterval
  );

  if (presentationResponseMessage) {
    return presentationResponseMessage;
  } else {
  }
};
