import { BladeSigner } from "@bladelabs/blade-web3.js";
import { useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { v4 as uuidv4 } from "uuid";
import { LoadingState, Responders } from "../../App";
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
  vcFile: any;
  setVcFile: React.Dispatch<any>;
  responders: Responders[];
  setResponders: React.Dispatch<React.SetStateAction<Responders[]>>;
  topicId?: string;
}

const VcQuery: React.FC<VcQueryProps> = ({
  signer,
  topicId,
  loading,
  setLoading,
  credPrivateKey,
  vcFile,
  setVcFile,
  responders,
  setResponders,
}) => {
  const [cid, setCid] = useState("");
  const [getRespondersSuccess, setGetRespondersSuccess] = useState<
    boolean | undefined
  >(undefined);

  if (!signer || !credPrivateKey) {
    return (
      <Accordion.Item eventKey="vc-query">
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
        setVcFile(file);
        setLoading({ id: undefined });
      } catch (error) {
        setVcFile(null);
        setLoading({ id: undefined });
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
          vc_id: vcFile?.id,
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
                const responders = queryRespondersMessages.map((item: any) => {
                  return {
                    did: item.responder_did,
                    publicKey: item.response_ephem_public_key,
                  };
                });
                setResponders(responders);
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
      <Accordion.Item eventKey="vc-query">
        <Accordion.Header>
          <b>VC Query </b> {vcFile?.id}
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
            {vcFile ? (
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
              isSuccess={vcFile === undefined ? vcFile : !!vcFile}
              text={vcFile?.id ? `VC ID: ${vcFile?.id}` : "Get VC Failed"}
            />
          </div>
          {vcFile && (
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
          {responders.length > 0 && (
            <ul className="mt-3">
              {responders.map((item) => (
                <li key={item.did}>Responder: {item.did}</li>
              ))}
            </ul>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  }
};

export default VcQuery;
