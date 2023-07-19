import { Client, FileId } from "@hashgraph/sdk";
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
import { documentLoader, generateKeyPair, pollRequest } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";

interface RequestProps {
  credential: any;
  client: Client;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMethod: any;
  credPrivateKey: string;
  credPublicKey: string;
  topicId?: string;
}

const Request: React.FC<RequestProps> = ({
  credential,
  client,
  topicId,
  setLoading,
  selectedMethod,
  credPrivateKey,
  credPublicKey,
}) => {
  const [presentationResponse, setPresentationResponse] = useState<any>();
  const [responderDids, setResponderDids] = useState<string[] | []>([]);
  const [vcId, setvcId] = useState("");
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
    validUntil: string;
  }) => {
    const newCredential = {
      ...credential,
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        // TODO: Update hardcoded context
        "https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz",
      ],
      issuer: {
        ...issuer,
        id: credentialSubject.id,
        name: "Self Asserted",
      },
      credentialSubject: {
        ...credentialSubject,
        // TODO: Update hardcoded type
        type: "auditor_template",
        valid_until: validUntil,
      },
    };
    // Remove `credentialStatus` field from the formated credential
    delete newCredential.credentialStatus;

    return newCredential;
  };

  // Send presentation request to HCS
  const handleSendPresentationRequest = async (responderDid: string) => {
    // Create file in HFS
    const presentationResponse = await createFile(
      client,
      process.env.REACT_APP_RESPONDER_DID_PRIVATE_KEY_HEX || "",
      process.env.REACT_APP_RESPONDER_DID_PUBLIC_KEY_HEX || "",
      JSON.stringify(contents)
    ).then(async (fileId) => {
      return await handleGetPresentationResponse({ fileId, responderDid });
    });

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
    submitMessage(presentationRequestMessage, client, topicId);

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
    }, 15000);

    // console.log({ presentationResponseMessage });
    // get response file's contents
    const responseFileId =
      (presentationResponseMessage as PresentationResponseMessage | undefined)
        ?.response_file_id || "";

    const fileContents = await getFileContents(client, responseFileId);
    setPresentationResponse(fileContents);
  };

  const handleQueryResponders = async () => {
    try {
      setLoading(true);

      const requestId = uuidv4();
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
      submitMessage(presentationQueryMessage, client, topicId).then(
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

          const responderDids = queryRespondersMessages.map(
            (item: any) => item.responder_did
          );

          setResponderDids(responderDids);

          const { credentialSubject, issuer } = credential;

          const validUntil = format(
            add(new Date(credentialSubject.valid_until), { years: 1 }),
            "yyyy-MM-dd"
          );

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
          setLoading(false);
        }
      );
    } catch (error) {
      console.log({ error });
      setLoading(false);
    }
  };

  const handleChangeVcId = (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    setvcId(e.target.value);
  };

  return (
    <div>
      <Form.Label>vc_id</Form.Label>
      <Form.Control
        type="text"
        placeholder="vc_id"
        onChange={handleChangeVcId}
      />
      {selectedMethod && (
        <div className="request-button">
          <Button onClick={handleQueryResponders} disabled={vcId === ""}>
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
