import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { NetworkType, Responder } from "../AppProvider";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";
import sendPresentationRequest from "./sendPresentationRequest";

// Send presentation request to HCS
const handleSendPresentationRequest = async ({
  fileId,
  responderDid,
  addLoader,
  removeLoader,
  signer,
  topicId,
  cipher,
  responders,
  setResponders,
  credentialVerificationKey,
  loaderId,
  network,
}: {
  fileId: string;
  responderDid: string;
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  signer: HashConnectSigner;
  topicId?: string;
  cipher: any;
  responders: Responder[];
  setResponders: (value: React.SetStateAction<Responder[]>) => void;
  credentialVerificationKey: any;
  loaderId: string;
  network: NetworkType;
}) => {
  try {
    addLoader(loaderId);
    // Remove old response from responder before sending new request
    setResponders((prev) =>
      prev.map((responder) => {
        if (responder.did === responderDid) {
          return { ...responder, presentationResponse: undefined };
        } else return responder;
      })
    );

    const timeStamp = Date.now();
    await sendPresentationRequest({
      fileId,
      responderDid,
      signer,
      topicId,
    }).then(async ({ isSuccess, requestId }) => {
      if (isSuccess && requestId) {
        const responseMessage = await handlePollPresentationResponseRequest({
          requestId,
          topicId,
          timeStamp,
          network,
        });

        let presentationResponse: any;

        if (responseMessage) {
          if (responseMessage.error) {
            presentationResponse = {
              error: responseMessage.error,
            };
          } else {
            const data = await decryptPresentationResponseMessage({
              cipher,
              presentationResponseMessage: responseMessage,
              credentialVerificationKey,
            });
            presentationResponse = {
              data,
            };
          }
        } else {
          presentationResponse = {
            error: { message: "Send request failed" },
          };
        }

        if (!presentationResponse) {
          presentationResponse = {
            error: { message: "Unable to process the request file." },
          };
        }

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
      }
    });
  } catch (error) {
    console.log("send presentation request failed: ", error);
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
    removeLoader(loaderId);
  }
};

export default handleSendPresentationRequest;
