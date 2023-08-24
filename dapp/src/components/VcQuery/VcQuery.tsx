import { useContext, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { getTopicMessages } from "../../hederaService";
import { MessageType, PresentationQueryMessage } from "../../types";
import { ResultType, fetchIPFSFile, pollRequest } from "../../utils";
import { AppContext } from "../AppProvider";
import { Button, StatusLabel } from "../common";

const exploreLworksUrl = "https://explore.lworks.io/testnet/topics";

const VcQuery = () => {
  const {
    signer,
    loading,
    setLoading,
    vcFile,
    setVcFile,
    responders,
    setResponders,
    topicId,
    credentialKey,
    vcVerificaitonResult,
  } = useContext(AppContext);

  const [cid, setCid] = useState("");
  const [getRespondersSuccess, setGetRespondersSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [getRespondersErrMsg, setgetRespondersErrMsg] = useState("");

  if (!signer || !credentialKey || !vcVerificaitonResult) {
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
                    publicKey: item.response_ephem_public_key,
                    accountId: item.payer_account_id,
                  };
                });
                setResponders(responders);
                setGetRespondersSuccess(true);
                setLoading({ id: undefined });
              } else {
                setgetRespondersErrMsg("No responder found");
                setGetRespondersSuccess(false);
                setLoading({ id: undefined });
              }
            } else {
              setGetRespondersSuccess(false);
              setgetRespondersErrMsg("Query Responders Failed");
              setLoading({ id: undefined });
            }
          }
        );
      } catch (error) {
        console.log({ error });
        setLoading({ id: undefined });
        setGetRespondersSuccess(false);
        setgetRespondersErrMsg((error as any).message);
      }
    };

    const handleChangeCid = (e: React.ChangeEvent<any>) => {
      e.preventDefault();
      setCid(e.target.value);
    };

    const fetchVcFileSuccess = vcFile ? !!vcFile?.id : undefined;

    return (
      <Accordion.Item eventKey="vc-query">
        <Accordion.Header>
          <b>VC Query&nbsp;</b> {vcFile?.id ? `(${vcFile?.id})` : ""}
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
              isSuccess={
                loading.id === "handleFetchIpfs"
                  ? undefined
                  : fetchVcFileSuccess
              }
              text={vcFile?.id ? `VC ID: ${vcFile?.id}` : "Get VC Failed"}
            />
          </div>
          {!!vcFile?.id && (
            <div className="d-flex mt-4">
              <Button
                onClick={handleQueryResponders}
                text="Query Responders"
                loading={loading.id === "handleQueryResponders"}
              />
              <StatusLabel
                isSuccess={
                  loading.id === "handleQueryResponders"
                    ? undefined
                    : getRespondersSuccess
                }
                text={
                  getRespondersSuccess
                    ? "Query Responders Success"
                    : getRespondersErrMsg
                }
              />
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
  }
};

export default VcQuery;
