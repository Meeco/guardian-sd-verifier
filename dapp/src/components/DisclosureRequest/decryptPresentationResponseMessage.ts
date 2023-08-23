import { Client } from "@hashgraph/sdk";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { getFileContents } from "../../fileService";
import { PresentationResponseMessage } from "../../types";
import { decryptData } from "../../utils";

export interface PresentationResponse {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

const decryptPresentationResponseMessage = async ({
  client,
  presentationResponseMessage,
  requesterKeyPair,
}: {
  client: Client;
  presentationResponseMessage?: PresentationResponseMessage;
  requesterKeyPair: nacl.BoxKeyPair;
}) => {
  if (presentationResponseMessage?.error) {
    const { error } = presentationResponseMessage;
    const response: PresentationResponse = {
      error,
    };
    return response;
  } else {
    // get response file's contents
    const responseFileId = presentationResponseMessage?.response_file_id || "";
    const responseNonce =
      presentationResponseMessage?.response_file_nonce || "";
    const responseEphemPublicKey =
      presentationResponseMessage?.response_ephem_public_key || "";

    const decodedResponseEphemPublicKey = naclUtil.decodeBase64(
      responseEphemPublicKey
    );

    const fileContents = await getFileContents({
      client,
      fileId: responseFileId,
    });

    if (fileContents) {
      const nonce = naclUtil.decodeBase64(responseNonce);
      const presentationResponse = decryptData({
        message: fileContents,
        nonce,
        privatekey: requesterKeyPair.secretKey,
        publickey: decodedResponseEphemPublicKey,
      });

      if (presentationResponse) {
        const data = JSON.parse(naclUtil.encodeUTF8(presentationResponse));
        const response: PresentationResponse = {
          data,
        };

        return response;
      } else {
        throw new Error("Presentation response is empty");
      }
    } else {
      throw new Error("response file is empty");
    }
  }
};

export default decryptPresentationResponseMessage;
