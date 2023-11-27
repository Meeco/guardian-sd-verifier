import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { NetworkType } from "../AppProvider";
import { PresentationResponseTopicMessage } from "./components/DisclosureRequest";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";
import sendPresentationRequest from "./sendPresentationRequest";

// Send presentation request to HCS
const handleSendPresentationRequest = async ({
  fileId,
  responderDid,
  addLoader,
  removeLoader,
  signer,
  topicId,
  loaderId,
  network,
  setPresentationResponseTopicMessage,
}: {
  fileId: string;
  responderDid: string;
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  signer: HashConnectSigner;
  topicId?: string;
  loaderId: string;
  network: NetworkType;
  setPresentationResponseTopicMessage: React.Dispatch<
    React.SetStateAction<PresentationResponseTopicMessage | undefined>
  >;
}) => {
  try {
    addLoader(loaderId);

    const timeStamp = Date.now();
    await sendPresentationRequest({
      fileId,
      responderDid,
      signer,
      topicId,
    }).then(async ({ isSuccess, requestId }) => {
      if (isSuccess && requestId) {
        const message = await handlePollPresentationResponseRequest({
          requestId,
          topicId,
          timeStamp,
          network,
        });

        const responseMessage: PresentationResponseTopicMessage = {};

        if (message !== undefined) {
          if (message.error) {
            responseMessage.error = message.error;
          } else {
            responseMessage.fileCid = message.response_file_cid;
          }
        } else {
          responseMessage.error = { message: "Send request failed" };
        }

        setPresentationResponseTopicMessage(responseMessage);
        removeLoader(loaderId);
      }
    });
  } catch (error) {
    console.log("send presentation request failed: ", error);
    setPresentationResponseTopicMessage({
      error: { message: (error as any).message },
    });
    removeLoader(loaderId);
  }
};

export default handleSendPresentationRequest;
