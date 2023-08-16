import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { MessageType, PresentationRequestMessage } from "../../types";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

// Get presentation response from HCS
const handleSendPresentationRequest = async ({
  responderDid,
  fileId,
  requesterNonce,
  requesterEmphem,
  signer,
  topicId,
  setSendRequestSuccess,
}: {
  fileId?: FileId | null;
  responderDid: string;
  requesterNonce: Uint8Array;
  requesterEmphem: nacl.BoxKeyPair;
  signer: BladeSigner;
  topicId?: string;
  setSendRequestSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
}) => {
  const requestId = uuidv4();

  const presentationRequestMessage: PresentationRequestMessage = {
    operation: MessageType.PRESENTATION_REQUEST,
    recipient_did: responderDid,
    request_id: requestId,
    request_file_id: fileId?.toString() || "",
    request_file_nonce: naclUtil.encodeBase64(requesterNonce),
    request_ephem_public_key: naclUtil.encodeBase64(requesterEmphem.publicKey),
    version: "x25519-xsalsa20-poly1305",
  };

  // send presentation request to HCS
  const presentationRequestMessageStr = JSON.stringify(
    presentationRequestMessage
  );
  const presentationResponseMessage = submitMessage(
    presentationRequestMessageStr,
    signer,
    topicId
  ).then(async (isSuccess) => {
    if (isSuccess) {
      return handlePollPresentationResponseRequest({
        requestId,
        setSendRequestSuccess,
        topicId,
      });
    } else {
      setSendRequestSuccess(false);
    }
  });

  return presentationResponseMessage;
};

export default handleSendPresentationRequest;
