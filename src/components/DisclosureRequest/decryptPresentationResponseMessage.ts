import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
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
  hcSigner,
  cipher,
  presentationResponseMessage,
  credentialVerificationKey,
}: {
  hcSigner: HashConnectSigner;
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
      const responseFileId =
        presentationResponseMessage?.response_file_id || "";

      const fileContentsBuffer = await getFileContents({
        hcSigner,
        fileId: responseFileId,
      });

      if (fileContentsBuffer) {
        const fileContents = Buffer.from(fileContentsBuffer).toString("utf-8");

        const keyAgreementKey = await deriveKeyAgreementKey(
          credentialVerificationKey
        );

        const decrypted = await cipher.decryptObject({
          jwe: JSON.parse(fileContents),
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
