import { getTopicMessages } from "../../consensusService";
import { MessageType, PresentationResponseMessage } from "../../types";
import { pollRequest } from "../../utils";
import { NetworkType } from "../AppProvider";

export const handlePollPresentationResponseRequest = async ({
  requestId,
  topicId,
  timeStamp,
  network,
}: {
  requestId: string;
  topicId?: string;
  timeStamp: number;
  network: NetworkType;
}) => {
  const presentationResponseMessage = await pollRequest(async () => {
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
  }, 60000);

  if (presentationResponseMessage) {
    return presentationResponseMessage;
  } else {
  }
};
