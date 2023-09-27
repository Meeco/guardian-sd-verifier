import { useCallback, useContext, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../../consensusService";
import { EventKey } from "../../../constants";
import { getTopicMessages } from "../../../hederaService";
import { MessageType, PresentationQueryMessage } from "../../../types";
import { ResultType, fetchIPFSFile, pollRequest } from "../../../utils";
import { AppContext } from "../../AppProvider";
import { AccordianToggleButton, Button, StatusLabel } from "../../common";
import QueryRespondersButton from "./QueryRespondersButton";

const exploreLworksUrl = "https://explore.lworks.io/testnet/topics";

const VcQuery = () => {
  const {
    signer,
    activeLoaders,
    addLoader,
    removeLoader,
    vcResponse,
    setVcResponse,
    responders,
    setResponders,
    topicId,
    cid,
    setCid,
    credentialDid,
  } = useContext(AppContext);

  const [getRespondersSuccess, setGetRespondersSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [getRespondersErrMsg, setgetRespondersErrMsg] = useState("");

  const handleFetchIpfs = async () => {
    try {
      addLoader("handleFetchIpfs");
      const file = await fetchIPFSFile(cid, { resultType: ResultType.JSON });
      setVcResponse(file);
      removeLoader("handleFetchIpfs");
    } catch (error) {
      setVcResponse(null);
      removeLoader("handleFetchIpfs");
      console.log({ error });
    }
  };

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
        submitMessage(presentationQueryMessage, signer, topicId).then(
          async (isSuccess) => {
            if (isSuccess) {
              const queryRespondersMessages = await pollRequest(async () => {
                // Get query response from mirror node
                const topicMessages = await getTopicMessages({
                  topicId: topicId || "",
                  timeStamp,
                });
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
          }
        );
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
    removeLoader,
    setResponders,
    signer,
    topicId,
    vcResponse?.id,
  ]);

  const handleChangeCid = (e: React.ChangeEvent<any>) => {
    setCid(e.target.value);
  };

  const fetchVcResponseSuccess = vcResponse ? !!vcResponse?.id : undefined;

  return (
    <Accordion.Item eventKey={EventKey.VcQuery}>
      <Accordion.Header>
        <b>VC Query&nbsp;</b> {vcResponse?.id ? `(${vcResponse?.id})` : ""}
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
            value={cid}
          />
          {vcResponse ? (
            <a
              href={`https://ipfs.io/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="mx-2 mb-2"
            >
              <BoxArrowUpRight />
            </a>
          ) : null}
        </div>
        <div className="d-flex mt-3">
          <Button
            onClick={handleFetchIpfs}
            text="Get VC"
            loading={activeLoaders.includes("handleFetchIpfs")}
            disabled={!cid}
          />
          <StatusLabel
            isSuccess={
              activeLoaders.includes("handleFetchIpfs")
                ? undefined
                : fetchVcResponseSuccess
            }
            text={vcResponse?.id ? `VC ID: ${vcResponse?.id}` : "Get VC Failed"}
          />
        </div>
        {!!vcResponse?.id && (
          <div className="mt-3">
            <div className="d-flex">
              <QueryRespondersButton
                handleQueryResponders={handleQueryResponders}
                getRespondersSuccess={getRespondersSuccess}
                getRespondersErrMsg={getRespondersErrMsg}
              />
            </div>
            {getRespondersSuccess ? (
              <div className="mt-2">
                <AccordianToggleButton
                  text="Next"
                  eventKey={EventKey.DisclosureRequest}
                />
              </div>
            ) : null}
          </div>
        )}
        {responders.length > 0 && (
          <>
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
          </>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default VcQuery;
