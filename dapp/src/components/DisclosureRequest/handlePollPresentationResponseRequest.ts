import { BladeSigner } from "@bladelabs/blade-web3.js";
import { getFileContents } from "../../fileService";
import { getTopicMessages } from "../../hederaService";
import { MessageType, PresentationResponseMessage } from "../../types";
import { pollRequest } from "../../utils";

export const handlePollPresentationResponseRequest = async ({
  requestId,
  signer,
  topicId,
  setSendRequestSuccess,
}: {
  requestId: string;
  signer: BladeSigner;
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

  // get response file's contents
  const responseFileId =
    (presentationResponseMessage as PresentationResponseMessage | undefined)
      ?.response_file_id || "";

  const fileContents = await getFileContents(signer, responseFileId);

  if (fileContents) {
    setSendRequestSuccess(true);
    return fileContents;
  } else {
    setSendRequestSuccess(false);
  }
};
