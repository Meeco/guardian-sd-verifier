import { BladeSigner } from "@bladelabs/blade-web3.js";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { createFile } from "../../fileService";
import { MessageType, PresentationRequestMessage } from "../../types";
import { encryptData } from "../../utils";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

// Get presentation response from HCS
const handleSendPresentationRequest = async ({
  responderDid,
  presentationRequest,
  requesterNonce,
  requesterEmphem,
  responderEmphemPublickey,
  signer,
  topicId,
  setSendRequestSuccess,
}: {
  presentationRequest: any;
  responderDid: string;
  requesterNonce: Uint8Array;
  requesterEmphem: nacl.BoxKeyPair;
  responderEmphemPublickey: string;
  signer: BladeSigner;
  topicId?: string;
  setSendRequestSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
}) => {
  try {
    const requestId = uuidv4();
    const presentationRequestStr = JSON.stringify(presentationRequest);

    const message = naclUtil.decodeUTF8(presentationRequestStr);
    const responderEmphemPublickeyBytes = naclUtil.decodeBase64(
      responderEmphemPublickey
    );

    const encryptedMessage = encryptData({
      message,
      nonce: requesterNonce,
      privatekey: requesterEmphem.secretKey,
      publickey: responderEmphemPublickeyBytes,
    });

    const fileId = await createFile(signer, encryptedMessage);

    const presentationRequestMessage: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
      recipient_did: responderDid,
      request_id: requestId,
      request_file_id: fileId?.toString() || "",
      request_file_nonce: naclUtil.encodeBase64(requesterNonce),
      request_ephem_public_key: naclUtil.encodeBase64(
        requesterEmphem.publicKey
      ),
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
  } catch (error) {
    console.log({ error });
    setSendRequestSuccess(false);
  }
};

export default handleSendPresentationRequest;
