import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import { Ed25519VerificationKey2018 } from "@transmute/ed25519-signature-2018";
import { useState } from "react";
import { Accordion, Button, Form, FormCheck, FormGroup } from "react-bootstrap";
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
} from "../../types";
import {
  ResultType,
  documentLoader,
  fetchIPFSFile,
  generateKeyPair,
  pollRequest,
} from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";

interface VcQueryProps {
  verifiableCredential: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMethod: any;
  credPrivateKey: string;
  credPublicKey: string;
  signer: BladeSigner | null;
  topicId?: string;
}

const VcQuery: React.FC<VcQueryProps> = ({
  verifiableCredential,
  signer,
  topicId,
  setLoading,
  selectedMethod,
  credPrivateKey,
  credPublicKey,
}) => {
  const [presentationResponse, setPresentationResponse] = useState<any>();
  const [responderDids, setResponderDids] = useState<string[]>([]);
  const [cid, setCid] = useState("");
  const [contents, setContents] = useState<any>();
  const [ipfsFile, setIpfsFile] = useState<any>();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectableFields, setSelectableFields] = useState<string[]>([]);
  const [fileId, setFileId] = useState<FileId | null | undefined>();

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
    // TODO: Update this field
    const credentialType = "8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0";

    const handleGenKeyPair = async () => {
      const keyPair = await generateKeyPair({
        privateKeyHex: credPrivateKey,
      });

      return keyPair;
    };

    // Create file in HFS

    const handleCreateFile = async (responderDid: string) => {
      setLoading(true);
      const fileId = await createFile(signer, JSON.stringify(contents));
      setFileId(fileId);
      // TODO: Remove hardcode
      // setFileId("fileId" as unknown as FileId);
      setLoading(false);
    };

    // Send presentation request to HCS
    const handleSendRequest = async ({
      responderDid,
    }: {
      responderDid: string;
    }) => {
      setLoading(true);

      const presentationResponse = await handleGetPresentationResponse({
        fileId,
        responderDid,
      });
      setLoading(false);
      setPresentationResponse(presentationResponse);
    };

    const createPresentationDefinition = (id: string) => {
      const path = selectedFields.map(
        (field) => `$.credentialSubject.${field}`
      );
      return {
        comment:
          "Note: VP, OIDC, DIDComm, or CHAPI outer wrapper would be here.",
        presentation_definition: {
          id: uuidv4(),
          input_descriptors: [
            {
              id: "audit",
              name: "Audit Report Request",
              purpose: "Require further information to complete audit report.",
              constraints: {
                fields: [
                  {
                    path: ["$.id"],
                    filter: {
                      type: "string",
                      const: id, //vc.id
                    },
                  },
                  {
                    path,
                  },
                ],
              },
            },
          ],
        },
      };
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

    const handleGetFields = async () => {
      try {
        setLoading(true);
        const file = await fetchIPFSFile(cid, { resultType: ResultType.JSON });
        setIpfsFile(file);

        const selectedContext = file["@context"].filter((context: string) =>
          context.startsWith("https://ipfs.io/ipfs/")
        )[0];

        const contextDocument = await (await fetch(selectedContext)).json();
        const credentialContext =
          contextDocument["@context"][credentialType]["@context"];
        const contextFields = Object.keys(credentialContext);
        const preservedFields = [
          "@version",
          "@protected",
          "id",
          "type",
          "schema",
        ];
        const selectableFields = contextFields.filter(
          (field) => !preservedFields.includes(field)
        );
        setSelectableFields(selectableFields);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log({ error });
      }
    };

    const handleQueryResponders = async () => {
      try {
        setLoading(true);
        const requestId = uuidv4();
        const id = ipfsFile.id;

        const presentationDefinition = createPresentationDefinition(id);
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

              const { credentialSubject } = verifiableCredential;

              const keyPair = await handleGenKeyPair();
              if (keyPair) {
                const { keyData, suite } = keyPair;
                // create authorization_details
                const authDetails = await createAuthDetails({
                  verifiableCredential,
                  challenge: "challenge",
                  documentLoader,
                  keyData: keyData as unknown as Ed25519VerificationKey2018,
                  suite,
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
              } else {
                throw new Error("Key data is required");
              }
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

    const handleSelectField = (e: React.ChangeEvent<any>) => {
      if (selectedFields.includes(e?.target.id)) {
        setSelectedFields((prevFields) =>
          prevFields.filter((field) => e.target.id !== field)
        );
      } else {
        setSelectedFields((prevFields) => [...prevFields, e.target.id]);
      }
    };

    return (
      <Accordion.Item eventKey="request">
        <Accordion.Header>
          <b>VC Query</b>
        </Accordion.Header>
        <Accordion.Body>
          <Form.Label>CID</Form.Label>
          <Form.Control
            type="text"
            placeholder="CID"
            onChange={handleChangeCid}
          />
          {selectedMethod && (
            <div className="mt-3">
              <Button onClick={handleGetFields} disabled={cid === ""}>
                Query fields
              </Button>
            </div>
          )}
          {selectableFields && (
            <FormGroup className="mt-3">
              {selectableFields.map((field: string) => (
                <FormCheck
                  key={field}
                  id={field}
                  type="checkbox"
                  as="input"
                  label={field}
                  onChange={handleSelectField}
                  checked={selectedFields.includes(field)}
                />
              ))}
            </FormGroup>
          )}
          {selectedFields.length > 0 && (
            <div className="mt-3">
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
                    <Button onClick={() => handleCreateFile(responderDid)}>
                      Create presentation
                    </Button>
                    <div className="mt-3">
                      <Button
                        onClick={() => handleSendRequest({ responderDid })}
                        disabled={!fileId}
                      >
                        Send request
                      </Button>
                    </div>

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
        </Accordion.Body>
      </Accordion.Item>
    );
  }
};

export default VcQuery;
