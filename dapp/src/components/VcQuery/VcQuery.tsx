import { BladeSigner } from "@bladelabs/blade-web3.js";
import { useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { v4 as uuidv4 } from "uuid";
import { LoadingState } from "../../App";
import { submitMessage } from "../../consensusService";
import { getTopicMessages } from "../../hederaService";
import { MessageType, PresentationQueryMessage } from "../../types";
import { ResultType, fetchIPFSFile, pollRequest } from "../../utils";
import { Button, StatusLabel } from "../common";

interface VcQueryProps {
  loading: LoadingState;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  credPrivateKey: string;
  signer: BladeSigner | null;
  setVcFile: React.Dispatch<any>;
  responderDids: string[];
  setResponderDids: React.Dispatch<React.SetStateAction<string[]>>;
  topicId?: string;
}

const VcQuery: React.FC<VcQueryProps> = ({
  signer,
  topicId,
  loading,
  setLoading,
  credPrivateKey,
  setVcFile,
  responderDids,
  setResponderDids,
}) => {
  const [cid, setCid] = useState("");
  const [vcId, setVcId] = useState("");
  const [getVcSuccess, setGetVcSuccess] = useState<boolean | undefined>(
    undefined
  );
  const [getRespondersSuccess, setGetRespondersSuccess] = useState<
    boolean | undefined
  >(undefined);

  if (!signer || !credPrivateKey) {
    return (
      <Accordion.Item eventKey="request">
        <Accordion.Header>
          <b>VC Query</b>
        </Accordion.Header>
        <Accordion.Body>
          <p>Please complete previous sections</p>
        </Accordion.Body>
      </Accordion.Item>
    );
  } else {
    const handleFetchIpfs = async () => {
      try {
        setLoading({ id: "handleFetchIpfs" });
        const file = await fetchIPFSFile(cid, { resultType: ResultType.JSON });
        setVcId(file.id);
        setVcFile(file);
        setGetVcSuccess(true);
        setLoading({ id: undefined });
      } catch (error) {
        setLoading({ id: undefined });
        setGetVcSuccess(false);
        console.log({ error });
      }
    };

    const handleQueryResponders = async () => {
      try {
        setLoading({ id: "handleQueryResponders" });
        const requestId = uuidv4();
        // const presentationDefinition = createPresentationDefinition(vcId);
        // create presentation query message
        const presentationQuery: PresentationQueryMessage = {
          operation: MessageType.PRESENTATION_QUERY,
          request_id: requestId,
          vc_id: vcId,
          requester_did: process.env.REACT_APP_REQUESTER_DID || "",
          limit_hbar: 1,
        };

        const presentationQueryMessage = JSON.stringify(presentationQuery);
        // Send query message to HCS
        submitMessage(presentationQueryMessage, signer, topicId).then(
          async (isSuccess) => {
            if (isSuccess) {
              const queryRespondersMessages = await pollRequest(async () => {
                // Get query response from mirror node
                const topicMessages = await getTopicMessages(topicId || "");
                const messages = topicMessages?.filter(
                  (msg) =>
                    msg.request_id === requestId &&
                    msg.operation === MessageType.QUERY_RESPONSE
                );

                return messages;
              }, 15000);

              if (queryRespondersMessages) {
                const responderDids = queryRespondersMessages.map(
                  (item: any) => item.responder_did
                );
                setResponderDids(responderDids);
                setGetRespondersSuccess(true);
              }
              setLoading({ id: undefined });
            } else {
              setLoading({ id: undefined });
              setGetRespondersSuccess(false);
            }
          }
        );
      } catch (error) {
        console.log("handleQueryResponders===>", error);
        setLoading({ id: undefined });
        setGetRespondersSuccess(false);
      }
    };

    const handleChangeCid = (e: React.ChangeEvent<any>) => {
      e.preventDefault();
      setCid(e.target.value);
    };

    return (
      <Accordion.Item eventKey="request">
        <Accordion.Header>
          <b>VC Query </b> {vcId ? `(${vcId})` : undefined}
        </Accordion.Header>
        <Accordion.Body>
          <p>Create a request for selective disclosure of a discovered VC</p>
          <Form.Label>CID</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="CID"
              onChange={handleChangeCid}
              className="w-50"
            />
            {vcId ? (
              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noreferrer"
                className="mx-2"
              >
                <BoxArrowUpRight />
              </a>
            ) : null}
          </div>
          <div className="d-flex mt-3">
            <Button
              onClick={handleFetchIpfs}
              text="Get VC"
              loading={loading.id === "handleFetchIpfs"}
            />
            <StatusLabel
              isSuccess={getVcSuccess}
              text={getVcSuccess ? `VC ID: ${vcId}` : "Get VC Failed"}
            />
          </div>
          {vcId && (
            <div className="d-flex mt-4">
              <Button
                onClick={handleQueryResponders}
                text="Query Responders"
                loading={loading.id === "handleQueryResponders"}
              />
              <StatusLabel
                isSuccess={getRespondersSuccess}
                text={
                  getRespondersSuccess
                    ? "Query Responders Success"
                    : "Query Responders Failed"
                }
              />
            </div>
          )}
          {responderDids.length > 0 && (
            <ul>
              {responderDids.map((item) => (
                <li>Responder: {item}</li>
              ))}
            </ul>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  }
};

export default VcQuery;
