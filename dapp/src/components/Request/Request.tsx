import { Client, FileId } from "@hashgraph/sdk";
import { useState } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import ReactJson from "react-json-view";
import { v4 as uuidv4 } from "uuid";
import { submitMessage } from "../../consensusService";
import { createFile, getFileContents } from "../../fileService";
import { getTopicMessages } from "../../hederaService";
import {
  MessageType,
  PresentationQueryMessage,
  PresentationRequestMessage,
  PresentationResponseMessage,
  QueryResponseMessage,
} from "../../types";
import { generateKeyPair, pollRequest } from "../../utils";

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

  const handleGenKeyPair = async (id: string) => {
    const keyPair = await generateKeyPair({
      credentialSubject: credential.credentialSubject,
      publicKeyHex: credPublicKey,
      privateKeyHex: credPrivateKey,
    });
    return keyPair;
  };

  const getFormattedCredential = (
    issuer: any,
    credentialSubject: any,
    validUntil: string
  ) => {
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

  // Get presentation response from HCS
  const handleGetPresentationResponse = async (
    fileId?: FileId | null,
    queryResponseMessage?: QueryResponseMessage | PresentationResponseMessage
  ) => {
    const requestId = uuidv4();

    const presentationRequest: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
      request_id: requestId,
      recipient_did:
        (queryResponseMessage as QueryResponseMessage)?.responder_did || "",
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

    // get response file's contents
    const responseFileId =
      (presentationResponseMessage as PresentationResponseMessage | undefined)
        ?.response_file_id || "";

    const fileContents = await getFileContents(client, responseFileId);

    return fileContents;
  };

  // Send presentation request to HCS
  const handleSendPresentationRequest = async (
    contents: any,
    queryResponseMessage?: QueryResponseMessage | PresentationResponseMessage
  ) => {
    // Create file in HFS
    const presentationResponse = await createFile(
      client,
      process.env.REACT_APP_RESPONDER_DID_PRIVATE_KEY_HEX || "",
      process.env.REACT_APP_RESPONDER_DID_PUBLIC_KEY_HEX || "",
      JSON.stringify(contents)
    ).then(async (fileId) => {
      return await handleGetPresentationResponse(fileId, queryResponseMessage);
    });

    return presentationResponse;
  };

  const queryResponders = async () => {
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
          }, 10000);

          console.log({ queryRespondersMessages });

          const responderDids = queryRespondersMessages.map(
            (item: any) => item.responder_did
          );

          setResponderDids(responderDids);
          setLoading(false);

          // const { credentialSubject, issuer } = credential;

          // create authorization_details
          // const authDetails = await createAuthDetails(credentialSubject, issuer);

          // create presentation query file
          // const contents = {
          //   ...presentationDefinition,
          //   authorization_details: {
          //     ...authDetails,
          //     // TODO: update this to use credential's did
          //     did: process.env.REACT_APP_REQUESTER_DID,
          //   },
          // };

          // const res = await handleSendPresentationRequest(
          //   contents,
          //   queryResponseMessage
          // );

          // setPresentationResponse(res);
          // setLoading(false);
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
          <Button onClick={queryResponders} disabled={vcId === ""}>
            Query Responders
          </Button>
        </div>
      )}
      {responderDids && (
        <Accordion defaultActiveKey={responderDids[0]}>
          {responderDids.map((item) => (
            <Accordion.Item className="mt-4" key={item} eventKey={item}>
              <Accordion.Header>{item}</Accordion.Header>
              <Accordion.Body>
                <Button>Send request</Button>
                {presentationResponse && (
                  <div className="mt-4">
                    <ReactJson
                      src={presentationResponse}
                      name="presentation_response"
                      collapsed
                      theme={"monokai"}
                    />
                  </div>
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
