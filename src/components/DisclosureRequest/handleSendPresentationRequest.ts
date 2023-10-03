import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { Responder } from "../AppProvider";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";
import sendPresentationRequest from "./sendPresentationRequest";

// Send presentation request to HCS
const handleSendPresentationRequest = async ({
  responderDid,
  encryptedKeyId,
  addLoader,
  removeLoader,
  presentationRequest,
  signer,
  topicId,
  cipher,
  responders,
  setResponders,
  credentialVerificationKey,
}: {
  responderDid: string;
  encryptedKeyId: string;
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  presentationRequest: any;
  signer: HashConnectSigner;
  topicId?: string;
  cipher: any;
  responders: Responder[];
  setResponders: (value: React.SetStateAction<Responder[]>) => void;
  credentialVerificationKey: any;
}) => {
  try {
    addLoader(`handleSendRequest-${responderDid}`);
    const timeStamp = Date.now();
    await sendPresentationRequest({
      responderDid,
      encryptedKeyId,
      presentationRequest,
      signer,
      topicId,
      cipher,
    }).then(async ({ isSuccess, requestId }) => {
      if (isSuccess && requestId) {
        const responseMessage = await handlePollPresentationResponseRequest({
          requestId,
          topicId,
          timeStamp,
        });

        let presentationResponse: any;

        if (responseMessage) {
          if (responseMessage.error) {
            presentationResponse = {
              error: responseMessage.error,
            };
          } else {
            const data = await decryptPresentationResponseMessage({
              hcSigner: signer,
              cipher,
              presentationResponseMessage: responseMessage,
              credentialVerificationKey,
            });
            presentationResponse = {
              data,
            };
          }
        }

        if (presentationResponse) {
          const selectedIndex = responders.findIndex(
            (item) => item.did === responderDid
          );

          setResponders((prev) => {
            const updatedResponders = responders.map((r, index) => {
              if (index === selectedIndex) {
                return {
                  ...prev[index],
                  presentationResponse,
                };
              } else return prev[index];
            });

            return updatedResponders;
          });
        } else {
          throw new Error("Send request failed");
        }

        removeLoader(`handleSendRequest-${responderDid}`);
      }
    });
  } catch (error) {
    console.log({ error });
    const selectedIndex = responders.findIndex(
      (item) => item.did === responderDid
    );
    const updatedResponders = [...responders];
    updatedResponders[selectedIndex] = {
      ...updatedResponders[selectedIndex],
      presentationResponse: null,
    };

    setResponders((prev) => {
      const updatedResponders = responders.map((r, index) => {
        if (index === selectedIndex) {
          return {
            ...prev[index],
            presentationResponse: null,
          };
        } else return prev[index];
      });

      return updatedResponders;
    });
    removeLoader(`handleSendRequest-${responderDid}`);
  }
};

export default handleSendPresentationRequest;
