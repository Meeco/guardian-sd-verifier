import { BladeSigner } from "@bladelabs/blade-web3.js";
import NodeClient from "@hashgraph/sdk/lib/client/NodeClient";
import { LoadingState, Responder } from "../AppProvider";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";
import sendPresentationRequest from "./sendPresentationRequest";

// Send presentation request to HCS
const handleSendPresentationRequest = async ({
  responderDid,
  encyptedKeyId,
  setLoading,
  presentationRequest,
  signer,
  topicId,
  cipher,
  client,
  responders,
  setResponders,
}: {
  responderDid: string;
  encyptedKeyId: string;
  setLoading: (value: React.SetStateAction<LoadingState>) => void;
  presentationRequest: any;
  signer: BladeSigner;
  topicId?: string;
  cipher: any;
  client: NodeClient;
  responders: Responder[];
  setResponders: (value: React.SetStateAction<Responder[]>) => void;
}) => {
  try {
    setLoading({ id: `handleSendRequest-${responderDid}` });
    const responseMessage = await sendPresentationRequest({
      responderDid,
      encyptedKeyId,
      presentationRequest,
      signer,
      topicId,
      cipher,
    });

    const presentationResponse = await decryptPresentationResponseMessage({
      client,
      cipher,
      presentationResponseMessage: responseMessage,
    });

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

    setLoading({ id: undefined });
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
    setLoading({ id: undefined });
  }
};

export default handleSendPresentationRequest;
