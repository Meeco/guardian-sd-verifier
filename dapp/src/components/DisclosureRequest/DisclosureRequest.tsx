import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import React, { useState } from "react";
import { Accordion, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import * as nacl from "tweetnacl";
import { LoadingState } from "../../App";
import { Button, StatusLabel } from "../common";
import createPresentationRequest from "./createPresentationRequest";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";
import generateRequesterKeys from "./generateRequesterKeys";
import handleSendPresentationRequest from "./handleSendPresentationRequest";

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
  requesterPrivateKey: string;
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
  requesterPrivateKey,
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

    const { requesterEmphem, requesterKeyPair } =
      generateRequesterKeys(requesterPrivateKey);

    const requesterNonce = nacl.randomBytes(24);

    const handleCreatePresentationRequest = () => {
      createPresentationRequest({
        signer,
        credentialSubject,
        credPrivateKey,
        selectedFields,
        setCreatePresentationSuccess,
        setFileId,
        setLoading,
        setPresentationRequest,
        vcFile,
        verifiableCredential,
        requesterEmphem,
        requesterNonce,
      });
    };

    // Send presentation request to HCS
    const handleSendRequest = async ({
      responderDid,
    }: {
      responderDid: string;
    }) => {
      try {
        setLoading({ id: "handleSendRequest" });
        const responseMessage = await handleSendPresentationRequest({
          responderDid,
          fileId,
          requesterNonce,
          requesterEmphem,
          signer,
          topicId,
          setSendRequestSuccess,
        });

        const presentationResponse = decryptPresentationResponseMessage({
          presentationResponseMessage: responseMessage,
          signer,
          requesterKeyPair,
        });

        setLoading({ id: undefined });
        setPresentationResponse(presentationResponse);
      } catch (error) {
        console.log({ error });
      }
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
                  onClick={handleCreatePresentationRequest}
                  text="Create presentation"
                  loading={loading.id === "createPresentationRequest"}
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
                        collapsed
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
