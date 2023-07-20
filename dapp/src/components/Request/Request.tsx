import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import { add, format } from "date-fns";
import { useState } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import ReactJson from "react-json-view";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { createFile, getFileContents } from "../../fileService";
import { getTopicMessages } from "../../hederaService";
import presentationDefinition from "../../mock/presentation_definition.json";
import {
  MessageType,
  PresentationQueryMessage,
  PresentationRequestMessage,
  PresentationResponseMessage,
} from "../../types";
import {
  ResultType,
  documentLoader,
  fetchIPFSFile,
  generateKeyPair,
  pollRequest,
} from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";

interface RequestProps {
  credential: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMethod: any;
  credPrivateKey: string;
  credPublicKey: string;
  signer: BladeSigner;
  topicId?: string;
}

const Request: React.FC<RequestProps> = ({
  credential,
  signer,
  topicId,
  setLoading,
  selectedMethod,
  credPrivateKey,
  credPublicKey,
}) => {
  const [presentationResponse, setPresentationResponse] = useState<any>();
  const [responderDids, setResponderDids] = useState<string[] | []>([]);
  const [cid, setCid] = useState("");
  const [contents, setContents] = useState<any>();

  const handleGenKeyPair = async () => {
    const keyPair = await generateKeyPair({
      credentialSubject: credential.credentialSubject,
      publicKeyHex: credPublicKey,
      privateKeyHex: credPrivateKey,
    });
    return keyPair;
  };

  const getFormattedCredential = ({
    issuer,
    credentialSubject,
    validUntil,
  }: {
    issuer: any;
    credentialSubject: any;
    validUntil?: string;
  }) => {
    const newCredential = {
      ...credential,
      issuer: {
        ...issuer,
        id: credentialSubject.id,
        name: "Self Asserted",
      },
      credentialSubject: {
        ...credentialSubject,
        valid_until: validUntil,
      },
    };
    // Remove `credentialStatus` field from the formated credential
    delete newCredential.credentialStatus;

    return newCredential;
  };

  // Send presentation request to HCS
  const handleSendPresentationRequest = async (responderDid: string) => {
    setLoading(true);
    // Create file in HFS
    const presentationResponse = await createFile(
      signer,
      process.env.REACT_APP_RESPONDER_DID_PRIVATE_KEY_HEX || "",
      process.env.REACT_APP_RESPONDER_DID_PUBLIC_KEY_HEX || "",
      JSON.stringify(contents)
    ).then(async (fileId) => {
      return await handleGetPresentationResponse({ fileId, responderDid });
    });

    setLoading(false);
    return presentationResponse;
  };

  // Get presentation response from HCS
  const handleGetPresentationResponse = async ({
    responderDid,
    fileId,
  }: {
    fileId?: FileId | null;
    responderDid: string;
  }) => {
    const requestId = uuidv4();

    const presentationRequest: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
      request_id: requestId,
      recipient_did: responderDid,
      request_file_id: fileId?.toString() || "",
      // TODO: Update this field later
      request_file_dek_encrypted_base64: "",
      // TODO: Update this field later
      request_file_public_key_id: "",
    };

    // send presentation request to HCS
    const presentationRequestMessage = JSON.stringify(presentationRequest);
    submitMessage(presentationRequestMessage, signer, topicId);

    const presentationResponseMessage = await pollRequest(async () => {
      // Get presentation response from mirror node
      const topicMessages = (await getTopicMessages(
        topicId || ""
      )) as PresentationResponseMessage[];
      const message = topicMessages?.filter(
        (msg) =>
          msg.request_id === requestId &&
          msg.operation === MessageType.PRESENTATION_RESPONSE
      )[0];

      return message;
    }, 60000);

    // console.log({ presentationResponseMessage });
    // get response file's contents
    const responseFileId =
      (presentationResponseMessage as PresentationResponseMessage | undefined)
        ?.response_file_id || "";

    const fileContents = await getFileContents(signer, responseFileId);
    setPresentationResponse(fileContents);
  };

  const handleQueryResponders = async () => {
    try {
      setLoading(true);
      const requestId = uuidv4();
      const { id } = await fetchIPFSFile(cid, { resultType: ResultType.JSON });
      // create presentation query message
      const presentationQuery: PresentationQueryMessage = {
        operation: MessageType.PRESENTATION_QUERY,
        request_id: requestId,
        vc_id: id,
        requester_did: process.env.REACT_APP_REQUESTER_DID || "",
        limit_hbar: 1,
      };

      const presentationQueryMessage = JSON.stringify(presentationQuery);
      // Send query message to HCS
      submitMessage(presentationQueryMessage, signer, topicId).then(
        async () => {
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

            const { credentialSubject, issuer } = credential;

            const validUntil = credentialSubject.valid_until
              ? format(
                  add(new Date(credentialSubject.valid_until), { years: 1 }),
                  "yyyy-MM-dd"
                )
              : undefined;

            const formattedCredential = getFormattedCredential({
              issuer,
              credentialSubject,
              validUntil: validUntil,
            });

            const key = await handleGenKeyPair();

            // create authorization_details
            const authDetails = await createAuthDetails({
              verifiableCredential: formattedCredential,
              challenge: "challenge",
              documentLoader,
              key,
            });

            // create presentation query file
            const contents = {
              ...presentationDefinition,
              authorization_details: {
                ...authDetails,
                did: credentialSubject.id,
              },
            };

            setContents(contents);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.log({ error });
      setLoading(false);
    }
  };

  const handleChangeCid = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setCid(e.target.value);
  };

  return (
    <div>
      <Form.Label>CID</Form.Label>
      <Form.Control type="text" placeholder="CID" onChange={handleChangeCid} />
      {selectedMethod && (
        <div className="request-button">
          <Button onClick={handleQueryResponders} disabled={cid === ""}>
            Query Responders
          </Button>
        </div>
      )}
      {responderDids && (
        <Accordion defaultActiveKey={responderDids[0]}>
          {responderDids.map((responderDid) => (
            <Accordion.Item
              className="mt-4"
              key={responderDid}
              eventKey={responderDid}
            >
              <Accordion.Header>{responderDid}</Accordion.Header>
              <Accordion.Body>
                <Button
                  onClick={() => handleSendPresentationRequest(responderDid)}
                >
                  Send request
                </Button>
                {presentationResponse && (
                  <Accordion
                    className="mt-4"
                    defaultActiveKey={`${responderDid}-response`}
                  >
                    <Accordion.Item eventKey={`${responderDid}-response`}>
                      <Accordion.Header>Response</Accordion.Header>
                      <Accordion.Body>
                        {presentationResponse && (
                          <ReactJson
                            src={presentationResponse}
                            name="presentation_response"
                            theme={"monokai"}
                            collapseStringsAfterLength={30}
                          />
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default Request;
