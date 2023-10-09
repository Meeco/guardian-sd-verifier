import { HashConnectSigner } from "hashconnect/dist/cjs/provider/signer";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { MessageType, PresentationRequestMessage } from "../../types";

// Get presentation response from HCS
const sendPresentationRequest = async ({
  fileId,
  responderDid,
  signer,
  topicId,
}: {
  fileId: string;
  responderDid: string;
  signer: HashConnectSigner;
  topicId?: string;
}) => {
  try {
    const requestId = uuidv4();

    const presentationRequestMessage: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
      recipient_did: responderDid,
      request_id: requestId,
      request_file_id: fileId?.toString() || "",
    };

    // send presentation request to HCS
    const presentationRequestMessageStr = JSON.stringify(
      presentationRequestMessage
    );

    const isSuccess = await submitMessage({
      message: presentationRequestMessageStr,
      topicId,
      hcSigner: signer,
    });

    return { isSuccess, requestId };
  } catch (error) {
    console.log({ error });
    return { isSuccess: false, requestId: undefined };
  }
};

export default sendPresentationRequest;
