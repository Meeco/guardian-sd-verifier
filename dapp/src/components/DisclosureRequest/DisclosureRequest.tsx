import React, { useContext, useMemo, useState } from "react";
import { Accordion, Button, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import { EventKey } from "../../constants";
import { downloadJson } from "../../utils";
import { AppContext } from "../AppProvider";
import { Button as ButtonWithLoader, StatusLabel } from "../common";
import createPresentationRequest from "./createPresentationRequest";
import handleSendPresentationRequest from "./handleSendPresentationRequest";

const DisclosureRequest = () => {
  const {
    client,
    signer,
    topicId,
    loading,
    setLoading,
    verifiableCredential,
    vcResponse,
    selectedMethod,
    credentialKey,
    responders,
    setResponders,
    cipher,
  } = useContext(AppContext);

  const credentialSubject = verifiableCredential?.credentialSubject;
  const [presentationRequest, setPresentationRequest] = useState<any>();

  const [selectableFields, setSelectableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [getVcSchemeSuccess, setGetVcSchemeSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationSuccess, setCreatePresentationSuccess] = useState<
    boolean | undefined
  >(undefined);

  const displayedFields = useMemo(
    () => selectableFields.filter((field) => field !== "select-all"),
    [selectableFields]
  );

  const presentationResponseStatus = (
    presentationResponse: any,
    did: string
  ) => {
    if (loading.id === `handleSendRequest-${did}`) {
      return;
    }
    if (presentationResponse !== undefined) {
      if (presentationResponse?.data) return true;
      else return false;
    }
  };

  const presentationResponseStatusMessage = (presentationResponse: any) => {
    if (presentationResponse !== undefined) {
      if (presentationResponse?.data) return "Sent";
      else return presentationResponse?.error?.message ?? "Send request failed";
    } else return "";
  };

  if (!signer || !credentialKey || !client) {
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
        const selectedContext = vcResponse["@context"].filter(
          (context: string) => context.startsWith("https://ipfs.io/ipfs/")
        )[0];

        const contextDocument = await (await fetch(selectedContext)).json();
        const credentialType = vcResponse.credentialSubject.type;
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

    const handleCreatePresentationRequest = () => {
      createPresentationRequest({
        credentialSubject,
        credentialKey,
        selectedFields,
        setCreatePresentationSuccess,
        setLoading,
        setPresentationRequest,
        vcResponse,
        verifiableCredential,
      });
    };

    return (
      <Accordion.Item eventKey={EventKey.DisclosureRequest}>
        <Accordion.Header>
          <b>Disclosure Request</b>
        </Accordion.Header>
        <Accordion.Body>
          {selectedMethod && (
            <div className="d-flex mt-3">
              <ButtonWithLoader
                onClick={handleGetFields}
                text="Get VC Scheme"
                loading={loading.id === "handleGetFields"}
              />
              <StatusLabel
                isSuccess={
                  loading.id === "handleGetFields"
                    ? undefined
                    : getVcSchemeSuccess
                }
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
                <ButtonWithLoader
                  onClick={handleCreatePresentationRequest}
                  text="Create presentation"
                  loading={loading.id === "createPresentationRequest"}
                />
                <StatusLabel
                  isSuccess={
                    loading.id === "createPresentationRequest"
                      ? undefined
                      : createPresentationSuccess
                  }
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
                      <div className="d-flex w-100 align-items-center justify-content-between">
                        Presentation Request Document
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <ReactJson
                        src={presentationRequest}
                        name="request"
                        theme={"monokai"}
                        collapseStringsAfterLength={30}
                        collapsed
                      />
                      <Button
                        className="me-3 mt-3"
                        onClick={() =>
                          downloadJson(
                            presentationRequest,
                            "presentation_request.json"
                          )
                        }
                      >
                        Download
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )}
            </>
          )}
          {responders &&
            presentationRequest &&
            responders.map((responder) => {
              const { accountId, did, presentationResponse, encyptedKeyId } =
                responder;
              const isSuccess = presentationResponseStatus(
                presentationResponse,
                did
              );
              const statusText =
                presentationResponseStatusMessage(presentationResponse);

              return (
                <Accordion key={did}>
                  <Accordion.Item className="mt-4" eventKey={did}>
                    <Accordion.Header>
                      {did} ({accountId})
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="d-flex mt-2">
                        <ButtonWithLoader
                          onClick={() =>
                            handleSendPresentationRequest({
                              responderDid: did,
                              encyptedKeyId,
                              setLoading,
                              presentationRequest,
                              signer,
                              topicId,
                              cipher,
                              client,
                              responders,
                              setResponders,
                            })
                          }
                          text="Send request"
                          loading={loading.id === `handleSendRequest-${did}`}
                        />
                        <StatusLabel
                          isSuccess={
                            loading.id === `handleSendRequest-${did}`
                              ? undefined
                              : isSuccess
                          }
                          text={statusText}
                        />
                      </div>
                      {presentationResponse?.data && (
                        <Accordion
                          className="mt-4"
                          defaultActiveKey={`${did}-response`}
                        >
                          <Accordion.Item eventKey={`${did}-response`}>
                            <Accordion.Header>
                              <div className="d-flex w-100 align-items-center justify-content-between">
                                Disclosed Verifiable Presentation Document
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              <ReactJson
                                src={presentationResponse?.data}
                                name="presentation_response"
                                theme={"monokai"}
                                collapseStringsAfterLength={30}
                                collapsed
                              />
                              <Button
                                className="me-3 mt-3"
                                onClick={() =>
                                  downloadJson(
                                    presentationResponse?.data,
                                    "disclosed_verifiable_presentation_document.json"
                                  )
                                }
                              >
                                Download
                              </Button>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              );
            })}
        </Accordion.Body>
      </Accordion.Item>
    );
  }
};
export default DisclosureRequest;
