import { BladeSigner } from "@bladelabs/blade-web3.js";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { getFileContents } from "../../fileService";
import { PresentationResponseMessage } from "../../types";
import { decryptData } from "../../utils";

const decryptPresentationResponseMessage = async ({
  signer,
  presentationResponseMessage,
  requesterKeyPair,
}: {
  signer: BladeSigner;
  presentationResponseMessage?: PresentationResponseMessage;
  requesterKeyPair: nacl.BoxKeyPair;
}) => {
  // get response file's contents
  const responseFileId = presentationResponseMessage?.response_file_id || "";
  const responseNonce = presentationResponseMessage?.response_file_nonce || "";
  const responseEphemPublicKey =
    presentationResponseMessage?.response_ephem_public_key || "";

  const decodedResponseEphemPublicKey = naclUtil.decodeBase64(
    responseEphemPublicKey
  );

  const fileContents = await getFileContents(signer, responseFileId);
  const message = naclUtil.decodeBase64(fileContents);
  const nonce = naclUtil.decodeBase64(responseNonce);

  const presentationResponse = decryptData({
    message,
    nonce,
    privatekey: requesterKeyPair.secretKey,
    publickey: decodedResponseEphemPublicKey,
  });

  if (presentationResponse) {
    return presentationResponse;
  } else {
    throw new Error("Presentation reponse is empty");
  }
};

export default decryptPresentationResponseMessage;
