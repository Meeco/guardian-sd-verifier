import React, { useContext, useMemo, useState } from "react";
import { Accordion, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import * as nacl from "tweetnacl";
import { AppContext } from "../AppProvider";
import { Button, StatusLabel } from "../common";
import createPresentationRequest from "./createPresentationRequest";
import decryptPresentationResponseMessage, {
  PresentationResponse,
} from "./decryptPresentationResponseMessage";
import handleSendPresentationRequest from "./handleSendPresentationRequest";

const DisclosureRequest = () => {
  const {
    client,
    signer,
    topicId,
    loading,
    setLoading,
    verifiableCredential,
    vcFile,
    selectedMethod,
    credPrivateKey,
    responders,
    requesterPrivateKey,
  } = useContext(AppContext);

  const credentialSubject = verifiableCredential?.credentialSubject;
  const [presentationResponse, setPresentationResponse] =
    useState<PresentationResponse>();
  const [presentationRequest, setPresentationRequest] = useState<any>();

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

  const displayedFields = useMemo(
    () => selectableFields.filter((field) => field !== "select-all"),
    [selectableFields]
  );

  const presentationResponseStatus = useMemo(() => {
    if (sendRequestSuccess !== undefined) {
      if (presentationResponse?.data) return true;
      else return false;
    }
  }, [presentationResponse?.data, sendRequestSuccess]);

  const presentationResponseStatusMessage = useMemo(() => {
    if (sendRequestSuccess !== undefined) {
      if (presentationResponse?.data) return "Sent";
      else return presentationResponse?.error?.message ?? "Send request failed";
    } else return "";
  }, [
    presentationResponse?.data,
    presentationResponse?.error?.message,
    sendRequestSuccess,
  ]);

  if (!signer || !credPrivateKey || !client || !requesterPrivateKey) {
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
    const { requesterEmphem, requesterKeyPair } = requesterPrivateKey;

    const handleGetFields = async () => {
      try {
        setLoading({ id: "handleGetFields" });
        const selectedContext = vcFile["@context"].filter((context: string) =>
          context.startsWith("https://ipfs.io/ipfs/")
        )[0];

        const contextDocument = await (await fetch(selectedContext)).json();
        const credentialType = vcFile.credentialSubject.type;
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
        setSelectableFields([...selectableFields, "select-all"]);
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

    const handleSelectAll = () => {
      if (selectedFields === selectableFields) {
        setSelectedFields([]);
      } else setSelectedFields(selectableFields);
    };

    const requesterNonce = nacl.randomBytes(24);

    const handleCreatePresentationRequest = () => {
      createPresentationRequest({
        credentialSubject,
        credPrivateKey,
        selectedFields,
        setCreatePresentationSuccess,
        setLoading,
        setPresentationRequest,
        vcFile,
        verifiableCredential,
      });
    };

    // Send presentation request to HCS
    const handleSendRequest = async ({
      responderDid,
      responderEmphemPublickey,
    }: {
      responderDid: string;
      responderEmphemPublickey: string;
    }) => {
      try {
        setLoading({ id: "handleSendRequest" });
        const responseMessage = await handleSendPresentationRequest({
          responderDid,
          presentationRequest,
          requesterNonce,
          requesterEmphem,
          responderEmphemPublickey,
          signer,
          topicId,
          setSendRequestSuccess,
        });

        if (sendRequestSuccess) {
          const presentationResponse = await decryptPresentationResponseMessage(
            {
              client,
              presentationResponseMessage: responseMessage,
              requesterKeyPair,
            }
          );

          setPresentationResponse(presentationResponse);
        }

        setLoading({ id: undefined });
      } catch (error) {
        console.log({ error });
        setLoading({ id: undefined });
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
                <FormCheck
                  key="select-all"
                  id="select-all"
                  type="checkbox"
                  as="input"
                  label="Select all"
                  onChange={handleSelectAll}
                  checked={selectedFields === selectableFields}
                />
                {displayedFields.map((field: string) => (
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
                <Accordion className="mt-4">
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
          {responders && presentationRequest && (
            <Accordion defaultActiveKey={responders[0].did}>
              {responders.map((responder) => (
                <Accordion.Item
                  className="mt-4"
                  key={responder.did}
                  eventKey={responder.did}
                >
                  <Accordion.Header>{responder.did}</Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex mt-2">
                      <Button
                        onClick={() =>
                          handleSendRequest({
                            responderDid: responder.did,
                            responderEmphemPublickey: responder.publicKey,
                          })
                        }
                        text="Send request"
                        loading={loading.id === "handleSendRequest"}
                      />
                      <StatusLabel
                        isSuccess={presentationResponseStatus}
                        text={presentationResponseStatusMessage}
                      />
                    </div>
                    {presentationResponse?.data && (
                      <Accordion
                        className="mt-4"
                        defaultActiveKey={`${responder.did}-response`}
                      >
                        <Accordion.Item eventKey={`${responder.did}-response`}>
                          <Accordion.Header>
                            Disclosed Verifiable Presentation Document
                          </Accordion.Header>
                          <Accordion.Body>
                            <ReactJson
                              src={presentationResponse?.data}
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
