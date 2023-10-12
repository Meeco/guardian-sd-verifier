import { fetchIPFSFile } from "../../fileService";
import { ResultType } from "../../fileService/fetchIPFSFile";
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
  cipher,
  presentationResponseMessage,
  credentialVerificationKey,
}: {
  cipher: any;
  presentationResponseMessage?: PresentationResponseMessage;
  credentialVerificationKey: any;
}) => {
  if (presentationResponseMessage?.error) {
    const { error } = presentationResponseMessage;
    const response: PresentationResponse = {
      error,
    };
    return response;
  } else {
    try {
      // get response file's contents
      const responseFileCid =
        presentationResponseMessage?.response_file_cid || "";

      if (responseFileCid) {
        const fileContents = await fetchIPFSFile(responseFileCid, {
          resultType: ResultType.JSON,
        });

        const keyAgreementKey = await deriveKeyAgreementKey(
          credentialVerificationKey
        );

        const decrypted = await cipher.decryptObject({
          jwe: fileContents,
          keyAgreementKey,
        });

        return decrypted;
      } else {
        throw new Error("Unable to get file contents");
      }
    } catch (error) {
      console.log("decrypt presentation response failed: ", error);
      throw error;
    }
  }
};

export default decryptPresentationResponseMessage;
