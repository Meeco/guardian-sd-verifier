import { useCallback, useContext, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { v4 as uuidv4 } from "uuid";
import { getTopicMessages, submitMessage } from "../../consensusService";
import { EventKey } from "../../constants";
import { MessageType, PresentationQueryMessage } from "../../types";
import { pollRequest } from "../../utils";
import { AppContext } from "../AppProvider";
import { AccordionToggleButton } from "../common";
import QueryRespondersButton from "./QueryRespondersButton";

const QueryResponders = () => {
  const {
    signer,
    addLoader,
    removeLoader,
    vcResponse,
    responders,
    setResponders,
    topicId,
    credentialDid,
    setTopicId,
    network,
    defaultTopicId,
  } = useContext(AppContext);

  const exploreLworksUrl = `https://explore.lworks.io/${network}/topics`;

  const [getRespondersSuccess, setGetRespondersSuccess] = useState<boolean>();
  const [getRespondersErrMsg, setgetRespondersErrMsg] = useState("");

  const handleQueryResponders = useCallback(async () => {
    if (signer) {
      try {
        addLoader("handleQueryResponders");
        const requestId = uuidv4();
        // create presentation query message
        const presentationQuery: PresentationQueryMessage = {
          operation: MessageType.PRESENTATION_QUERY,
          request_id: requestId,
          vc_id: vcResponse?.id,
          requester_did: credentialDid,
          limit_hbar: 1,
        };

        const presentationQueryMessage = JSON.stringify(presentationQuery);
        // Send query message to HCS
        const timeStamp = Date.now();
        const isSuccess = await submitMessage({
          message: presentationQueryMessage,
          hcSigner: signer,
          topicId,
        });
        if (isSuccess) {
          const queryRespondersMessages = await pollRequest(async () => {
            // Get query response from mirror node
            const topicMessages = await getTopicMessages({
              topicId: topicId || "",
              timeStamp,
              network,
            });

            const messages = topicMessages?.filter(
              (msg) =>
                msg.request_id === requestId &&
                msg.operation === MessageType.QUERY_RESPONSE
            );

            if (messages && messages?.length > 0) {
              return messages;
            } else {
              return null;
            }
          }, 30000);

          if (queryRespondersMessages) {
            const responders = queryRespondersMessages.map((item: any) => {
              return {
                did: item.responder_did,
                accountId: item.payer_account_id,
                encryptedKeyId: item.response_file_encrypted_key_id,
              };
            });
            setResponders(responders);
            setGetRespondersSuccess(true);
            removeLoader("handleQueryResponders");
          } else {
            setgetRespondersErrMsg("No responder found");
            setGetRespondersSuccess(false);
            removeLoader("handleQueryResponders");
          }
        } else {
          setGetRespondersSuccess(false);
          setgetRespondersErrMsg("Query Responders Failed");
          removeLoader("handleQueryResponders");
        }
      } catch (error) {
        console.log({ error });
        removeLoader("handleQueryResponders");
        setGetRespondersSuccess(false);
        setgetRespondersErrMsg((error as any).message);
      }
    }
  }, [
    addLoader,
    credentialDid,
    network,
    removeLoader,
    setResponders,
    signer,
    topicId,
    vcResponse?.id,
  ]);

  const handleChangeTopicId = (e: React.ChangeEvent<any>) => {
    setTopicId(e.target.value);
  };

  return (
    <Accordion.Item eventKey={EventKey.QueryResponders}>
      <Accordion.Header>
        <b>Query Responders</b>
      </Accordion.Header>
      <Accordion.Body>
        <div className="mt-2">
          <div className="mt-2 mb-3">
            <Form.Label>Topic ID (deafult: {defaultTopicId})</Form.Label>
            <Form.Control
              type="text"
              placeholder="Topic ID"
              onChange={handleChangeTopicId}
              className="w-50"
              value={topicId}
            />
          </div>
          <div className="d-flex">
            <QueryRespondersButton
              disabled={!topicId}
              handleQueryResponders={handleQueryResponders}
              getRespondersSuccess={getRespondersSuccess}
              getRespondersErrMsg={getRespondersErrMsg}
            />
          </div>
          {getRespondersSuccess ? (
            <div className="mt-2">
              <AccordionToggleButton
                text="Next"
                eventKey={EventKey.DisclosureRequest}
              />
              <ul className="mt-3">
                {responders.map((responder) => {
                  const { accountId, did } = responder;
                  return (
                    <li key={did}>
                      Responder: {did} ({accountId})
                    </li>
                  );
                })}
              </ul>
              <a
                href={`${exploreLworksUrl}/${topicId}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="d-flex align-items-center">
                  View topic
                  <BoxArrowUpRight className="ms-2" />
                </div>
              </a>
            </div>
          ) : null}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default QueryResponders;
