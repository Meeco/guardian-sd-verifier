import { BladeSigner } from "@bladelabs/blade-web3.js";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { fetchResolveDid } from "../../didService";
import { createFile } from "../../fileService";
import { MessageType, PresentationRequestMessage } from "../../types";
import { deriveKeyAgreementKey } from "../../utils";

// Get presentation response from HCS
const sendPresentationRequest = async ({
  responderDid,
  encryptedKeyId = "did-root-key",
  presentationRequest,
  signer,
  topicId,
  cipher,
}: {
  presentationRequest: any;
  encryptedKeyId: string;
  responderDid: string;
  signer: BladeSigner;
  topicId?: string;
  cipher: any;
}) => {
  try {
    const requestId = uuidv4();

    const didDocument = await fetchResolveDid(responderDid);

    // Different key types use a different property
    const verificationKeys = (
      didDocument.publicKey ?? didDocument.verificationMethod
    ).filter(
      (item: any) =>
        encryptedKeyId === item.id ||
        encryptedKeyId === item.id.split("#").pop()
    );

    if (verificationKeys.length < 1) {
      throw new Error(
        `No key found for did document "${responderDid}" matching id "${encryptedKeyId}"`
      );
    }
    const [verificationKey] = verificationKeys;

    const responderKeyAgreement = await deriveKeyAgreementKey(verificationKey);

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
    };

    // send presentation request to HCS
    const presentationRequestMessageStr = JSON.stringify(
      presentationRequestMessage
    );
    const isSuccess = await submitMessage(
      presentationRequestMessageStr,
      signer,
      topicId
    );

    return { isSuccess, requestId };
  } catch (error) {
    console.log({ error });
    return { isSuccess: false, requestId: undefined };
  }
};

export default sendPresentationRequest;
