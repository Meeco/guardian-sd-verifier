import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import React, { useState } from "react";
import { Accordion, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import { v4 as uuidv4 } from "uuid";
import { LoadingState } from "../../App";
import { submitMessage } from "../../consensusService";
import { createFile } from "../../fileService";
import { MessageType, PresentationRequestMessage } from "../../types";
import { documentLoader, generateKeyPair } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { Button, StatusLabel } from "../common";
import { createPresentationDefinition } from "./createPresentationDefinition";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

interface DisclosureRequestProps {
  signer: BladeSigner | null;
  topicId?: string;
  loading: LoadingState;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  verifiableCredential: any;
  vcFile: any;
  selectedMethod: any;
  credPrivateKey: string;
  responderDids: string[];
}

const DisclosureRequest: React.FC<DisclosureRequestProps> = ({
  signer,
  topicId,
  loading,
  setLoading,
  verifiableCredential,
  vcFile,
  selectedMethod,
  credPrivateKey,
  responderDids,
}) => {
  const credentialSubject = verifiableCredential?.credentialSubject;
  const [presentationResponse, setPresentationResponse] = useState<any>();
  const [presentationRequest, setPresentationRequest] = useState<any>();
  const [fileId, setFileId] = useState<FileId | null | undefined>();

  const [selectableFields, setSelectableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [getVcSchemeSuccess, setGetVcSchemeSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationSuccess, setCreatePresentationSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [sendRequestSuccess, setSendRequestSuccess] = useState<
    boolean | undefined
  >(undefined);

  if (!signer || !credPrivateKey) {
    return (
      <Accordion.Item eventKey="disclosure-request">
        <Accordion.Header>
          <b>Disclosure Request</b>
        </Accordion.Header>
        <Accordion.Body>
          <p>Please complete previous sections</p>
        </Accordion.Body>
      </Accordion.Item>
    );
  } else {
    const handleGetFields = async () => {
      try {
        setLoading({ id: "handleGetFields" });
        const selectedContext = vcFile["@context"].filter((context: string) =>
          context.startsWith("https://ipfs.io/ipfs/")
        )[0];

        const contextDocument = await (await fetch(selectedContext)).json();
        const credentialType = credentialSubject.type;
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
        setGetVcSchemeSuccess(true);
        setLoading({ id: undefined });
      } catch (error) {
        setLoading({ id: undefined });
        setGetVcSchemeSuccess(false);
        console.log({ error });
      }
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

    const handleGenKeyPair = async () => {
      const keyPair = await generateKeyPair({
        privateKeyHex: credPrivateKey,
      });

      return keyPair;
    };

    // Create file in HFS

    const handleCreateFile = async () => {
      setLoading({ id: "handleCreateFile" });

      const keyPair = await handleGenKeyPair();
      if (keyPair) {
        const { keyData, suite } = keyPair;
        // create authorization_details
        const authDetails = await createAuthDetails({
          verifiableCredential,
          challenge: "challenge",
          documentLoader,
          keyData,
          suite,
        });

        const presentationDefinition = createPresentationDefinition(
          vcFile.id,
          selectedFields
        );

        // create presentation query file
        const contents = {
          ...presentationDefinition,
          authorization_details: {
            ...authDetails,
            did: credentialSubject.id,
          },
        };

        const fileId = await createFile(signer, JSON.stringify(contents));
        if (fileId) {
          setFileId(fileId);
          setCreatePresentationSuccess(true);
          setPresentationRequest(contents);
        } else {
          setCreatePresentationSuccess(false);
        }
        setLoading({ id: undefined });
      } else {
        setCreatePresentationSuccess(false);
        throw new Error("Key data is required");
      }
    };

    // Send presentation request to HCS
    const handleSendRequest = async ({
      responderDid,
    }: {
      responderDid: string;
    }) => {
      setLoading({ id: "handleSendRequest" });
      const presentationResponse = await handleGetPresentationResponse({
        fileId,
        responderDid,
      });
      setLoading({ id: undefined });
      setPresentationResponse(presentationResponse);
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
      const result = submitMessage(
        presentationRequestMessage,
        signer,
        topicId
      ).then(async (isSuccess) => {
        if (isSuccess) {
          return handlePollPresentationResponseRequest({
            requestId,
            signer,
            setSendRequestSuccess,
            topicId,
          });
        } else {
          setSendRequestSuccess(false);
        }
      });

      return result;
    };

    return (
      <Accordion.Item eventKey="disclosure-request">
        <Accordion.Header>
          <b>Disclosure Request</b>
        </Accordion.Header>
        <Accordion.Body>
          {selectedMethod && (
            <div className="d-flex mt-3">
              <Button
                onClick={handleGetFields}
                text="Get VC Scheme"
                loading={loading.id === "handleGetFields"}
              />
              <StatusLabel
                isSuccess={getVcSchemeSuccess}
                text={
                  getVcSchemeSuccess
                    ? "Get VC Scheme Success"
                    : "Get VC Scheme Failed"
                }
              />
            </div>
          )}
          {selectableFields.length > 0 && (
            <>
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
              <div className="d-flex mt-3">
                <Button
                  onClick={handleCreateFile}
                  text="Create presentation"
                  loading={loading.id === "handleCreateFile"}
                />
                <StatusLabel
                  isSuccess={createPresentationSuccess}
                  text={
                    createPresentationSuccess
                      ? "Created"
                      : "Create Presentation Failed"
                  }
                />
              </div>
              {presentationRequest && (
                <Accordion
                  className="mt-4"
                  defaultActiveKey="presentationRequest"
                >
                  <Accordion.Item eventKey="presentationRequest">
                    <Accordion.Header>
                      Presentation Request Document
                    </Accordion.Header>
                    <Accordion.Body>
                      <ReactJson
                        src={presentationRequest}
                        name="request"
                        theme={"monokai"}
                        collapseStringsAfterLength={30}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )}
            </>
          )}
          {responderDids && presentationRequest && (
            <Accordion defaultActiveKey={responderDids[0]}>
              {responderDids.map((responderDid) => (
                <Accordion.Item
                  className="mt-4"
                  key={responderDid}
                  eventKey={responderDid}
                >
                  <Accordion.Header>{responderDid}</Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex mt-2">
                      <Button
                        onClick={() => handleSendRequest({ responderDid })}
                        text="Send request"
                        loading={loading.id === "handleSendRequest"}
                      />
                      <StatusLabel
                        isSuccess={sendRequestSuccess}
                        text={
                          sendRequestSuccess ? "Sent" : "Send Request Failed"
                        }
                      />
                    </div>
                    {presentationResponse && (
                      <Accordion
                        className="mt-4"
                        defaultActiveKey={`${responderDid}-response`}
                      >
                        <Accordion.Item eventKey={`${responderDid}-response`}>
                          <Accordion.Header>
                            Disclosed Verifiable Presentation Document
                          </Accordion.Header>
                          <Accordion.Body>
                            <ReactJson
                              src={presentationResponse}
                              name="presentation_response"
                              theme={"monokai"}
                              collapseStringsAfterLength={30}
                            />
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
export default DisclosureRequest;
