import { fetchIPFSFile } from "../../fileService";
import { ResultType } from "../../fileService/fetchIPFSFile";
import { deriveKeyAgreementKey } from "../../utils";
import { Responder } from "../AppProvider";

export interface PresentationResponse {
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

const decryptPresentationResponseMessage = async ({
  cipher,
  fileCid,
  credentialVerificationKey,
  responders,
  setResponders,
  responderDid,
  loaderId,
  addLoader,
  removeLoader,
}: {
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  loaderId: string;
  cipher: any;
  fileCid: string;
  credentialVerificationKey: any;
  responderDid: string;
  responders: Responder[];
  setResponders: (value: React.SetStateAction<Responder[]>) => void;
}) => {
  addLoader(loaderId);

  try {
    // Remove old response from responder before sending new request
    setResponders((prev) =>
      prev.map((responder) => {
        if (responder.did === responderDid) {
          return { ...responder, presentationResponse: undefined };
        } else return responder;
      })
    );

    if (fileCid) {
      const fileContents = await fetchIPFSFile(fileCid, {
        resultType: ResultType.JSON,
      });

      const keyAgreementKey = await deriveKeyAgreementKey(
        credentialVerificationKey
      );

      const decrypted = await cipher.decryptObject({
        jwe: fileContents,
        keyAgreementKey,
      });

      const presentationResponse = { data: decrypted };

      const selectedIndex = responders.findIndex(
        (item) => item.did === responderDid
      );

      setResponders((prev) => {
        const updatedResponders = responders.map((_, index) => {
          if (index === selectedIndex) {
            return {
              ...prev[index],
              presentationResponse,
            };
          } else return prev[index];
        });

        return updatedResponders;
      });
      removeLoader(loaderId);

      // return `decrypted` value for testability because it's easier to test the decryption result
      // (`setResponders` args are anonymous functions which is hard to get the decryption result for comparison in test)
      return decrypted;
    } else {
      removeLoader(loaderId);
      throw new Error("Unable to get file contents");
    }
  } catch (error) {
    removeLoader(loaderId);
    console.log("decrypt presentation response failed: ", error);

    const selectedIndex = responders.findIndex(
      (item) => item.did === responderDid
    );

    setResponders((prev) => {
      const updatedResponders = responders.map((r, index) => {
        if (index === selectedIndex) {
          return {
            ...prev[index],
            presentationResponse: {
              error: {
                message: (error as any).message,
              },
            },
          };
        } else return prev[index];
      });

      return updatedResponders;
    });
  }
};

export default decryptPresentationResponseMessage;
