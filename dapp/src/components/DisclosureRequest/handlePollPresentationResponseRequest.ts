import { getTopicMessages } from "../../hederaService";
import { MessageType, PresentationResponseMessage } from "../../types";
import { pollRequest } from "../../utils";

export const handlePollPresentationResponseRequest = async ({
  requestId,
  topicId,
  setSendRequestSuccess,
}: {
  requestId: string;
  topicId?: string;
  setSendRequestSuccess: (
    value: React.SetStateAction<boolean | undefined>
  ) => void;
}) => {
  const presentationResponseMessage = await pollRequest(async () => {
    // Get presentation response from mirror node
    const topicMessages = (await getTopicMessages(
      topicId || ""
    )) as PresentationResponseMessage[];
    const message = topicMessages?.filter(
      (msg) =>
        msg.request_id === requestId &&
        msg.operation === MessageType.PRESENTATION_RESPONSE
    )[0];
    return message;
  }, 60000);

  if (presentationResponseMessage) {
    setSendRequestSuccess(true);
    return presentationResponseMessage;
  } else {
    setSendRequestSuccess(false);
  }

  // if (fileContents) {
  //   setSendRequestSuccess(true);
  //   return fileContents;
  // } else {
  //   setSendRequestSuccess(false);
  // }
};
