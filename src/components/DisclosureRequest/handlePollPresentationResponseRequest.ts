import { getTopicMessages } from "../../hederaService";
import { MessageType, PresentationResponseMessage } from "../../types";
import { pollRequest } from "../../utils";

export const handlePollPresentationResponseRequest = async ({
  requestId,
  topicId,
  timeStamp,
}: {
  requestId: string;
  topicId?: string;
  timeStamp: number;
}) => {
  const presentationResponseMessage = await pollRequest(async () => {
    // Get presentation response from mirror node
    const topicMessages = (await getTopicMessages({
      topicId: topicId || "",
      timeStamp,
    })) as PresentationResponseMessage[];
    const message = topicMessages?.filter(
      (msg) =>
        msg.request_id === requestId &&
        msg.operation === MessageType.PRESENTATION_RESPONSE
    )[0];
    return message;
  }, 15000);

  if (presentationResponseMessage) {
    return presentationResponseMessage;
  } else {
  }
};