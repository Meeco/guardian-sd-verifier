import { Client } from "@hashgraph/sdk";
import { getFileContents } from "../../fileService";
import { PresentationResponseMessage } from "../../types";
import { deriveKeyAgreementKey } from "../../utils";

export interface PresentationResponse {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

const decryptPresentationResponseMessage = async ({
  client,
  cipher,
  presentationResponseMessage,
}: {
  client: Client;
  cipher: any;
  presentationResponseMessage?: PresentationResponseMessage;
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

    const fileContentsBuffer = await getFileContents({
      client,
      fileId: responseFileId,
    });

    if (fileContentsBuffer) {
      const fileContents = Buffer.from(fileContentsBuffer).toString("utf-8");

      const keyAgreementKey = await deriveKeyAgreementKey({
        did: process.env.REACT_APP_REQUESTER_DID || "",
        didKeyId: process.env.REACT_APP_REQUESTER_DID_KEY_ID || "",
        privateKeyStr:
          process.env.REACT_APP_RREQUESTER_DID_PRIVATE_KEY_HEX || "",
        publicKeyStr: process.env.REACT_APP_RREQUESTER_DID_PUBLIC_KEY_HEX || "",
        type: "",
      });

      const decrypted = await cipher.decryptObject({
        jwe: fileContents,
        keyAgreementKey,
      });

      return decrypted;
    } else {
      throw new Error("response file is empty");
    }
  }
};

export default decryptPresentationResponseMessage;
