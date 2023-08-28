import { BladeSigner } from "@bladelabs/blade-web3.js";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { fetchResolveDid } from "../../didService";
import { createFile } from "../../fileService";
import { MessageType, PresentationRequestMessage } from "../../types";
import { deriveKeyAgreementKey } from "../../utils";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

// Get presentation response from HCS
const handleSendPresentationRequest = async ({
  responderDid,
  encyptedKeyId = "did-root-key",
  presentationRequest,
  signer,
  topicId,
  cipher,
}: {
  presentationRequest: any;
  encyptedKeyId: string;
  responderDid: string;
  signer: BladeSigner;
  topicId?: string;
  cipher: any;
}) => {
  try {
    const requestId = uuidv4();

    const didDocument = await fetchResolveDid(responderDid);

    const edVerificationKey = didDocument.publicKey.filter((item: any) => {
      const keyId = item.id.split("#")[1];
      return encyptedKeyId === `${keyId}`;
    })[0];

    const responderKeyAgreement = await deriveKeyAgreementKey({
      edVerificationKey,
      type: edVerificationKey.type,
    });

    const keyResolver = async () => responderKeyAgreement;

    const recipient = {
      header: {
        kid: responderKeyAgreement.id,
        alg: "ECDH-ES+A256KW",
      },
    };

    const encryptedMessage = await cipher.encryptObject({
      obj: presentationRequest,
      recipients: [recipient],
      keyResolver,
    }); // jwe

    const fileId = await createFile(signer, JSON.stringify(encryptedMessage));

    const presentationRequestMessage: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
      recipient_did: responderDid,
      request_id: requestId,
      request_file_id: fileId?.toString() || "",
      request_file_encrypted_key_id: "did-root-key",
      requester_did: process.env.REACT_APP_REQUESTER_DID || "",
      request_file_encryption_key_type: "X25519",
    };

    // send presentation request to HCS
    const presentationRequestMessageStr = JSON.stringify(
      presentationRequestMessage
    );
    const timeStamp = Date.now();
    const presentationResponseMessage = submitMessage(
      presentationRequestMessageStr,
      signer,
      topicId
    ).then(async (isSuccess) => {
      if (isSuccess) {
        return handlePollPresentationResponseRequest({
          requestId,
          topicId,
          timeStamp,
        });
      }
    });

    return presentationResponseMessage;
  } catch (error) {
    console.log({ error });
  }
};

export default handleSendPresentationRequest;
