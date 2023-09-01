import React, { useCallback, useContext, useMemo, useState } from "react";
import { Accordion, Button, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import { EventKey } from "../../../constants";
import { downloadJson } from "../../../utils";
import { AppContext } from "../../AppProvider";
import {
  AccordianToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../../common";
import createPresentationRequest from "../createPresentationRequest";
import handleSendPresentationRequest from "../handleSendPresentationRequest";
import CreatePresentationButton from "./CreatePresentationButton";
import GetVcButton from "./GetVcButton";

const DisclosureRequest = () => {
  const {
    client,
    signer,
    topicId,
    activeLoaders,
    addLoader,
    removeLoader,
    verifiableCredential,
    vcResponse,
    credentialVerificationKey,
    responders,
    setResponders,
    selectedMethod,
    cipher,
  } = useContext(AppContext);

  const credentialSubject = verifiableCredential?.credentialSubject;

  const [selectedContext, setSelectedContext] = useState<string | undefined>();
  const [credentialSubjectType, setCredntialSubjectType] = useState<
    string | undefined
  >();
  const [presentationRequest, setPresentationRequest] = useState<any>();

  const [selectableFields, setSelectableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [getVcSchemeSuccess, setGetVcSchemeSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationSuccess, setCreatePresentationSuccess] = useState<
    boolean | undefined
  >(undefined);
  const [createPresentationErrMsg, setCreatePresentationErrMsg] = useState("");

  const displayedFields = useMemo(
    () => selectableFields.filter((field) => field !== "select-all"),
    [selectableFields]
  );

  const presentationResponseStatus = (
    presentationResponse: any,
    did: string
  ) => {
    if (activeLoaders.includes(`handleSendRequest-${did}`)) {
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

  const handleGetFields = useCallback(async () => {
    try {
      addLoader("handleGetFields");
      const selectedContext = vcResponse["@context"].filter((context: string) =>
        context.startsWith("https://ipfs.io/ipfs/")
      )[0];
      setSelectedContext(selectedContext);

      const contextDocument = await (await fetch(selectedContext)).json();

      const credentialSubjectType = vcResponse.credentialSubject.type;
      setCredntialSubjectType(credentialSubjectType);

      const credentialContext =
        contextDocument["@context"][credentialSubjectType]["@context"];
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
      removeLoader("handleGetFields");
    } catch (error) {
      removeLoader("handleGetFields");
      setGetVcSchemeSuccess(false);
      console.log({ error });
    }
  }, [addLoader, removeLoader, vcResponse]);

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
    if (credentialVerificationKey) {
      try {
        createPresentationRequest({
          credentialSubject,
          credentialVerificationKey,
          selectedMethod,
          selectedFields,
          setCreatePresentationSuccess,
          addLoader,
          removeLoader,
          setPresentationRequest,
          vcResponse,
          verifiableCredential,
        });
        setCreatePresentationErrMsg("");
      } catch (error) {
        setCreatePresentationErrMsg((error as any).message);
      }
    }
  };

  return (
    <Accordion.Item eventKey={EventKey.DisclosureRequest}>
      <Accordion.Header>
        <b>Disclosure Request&nbsp;</b>{" "}
        {credentialSubjectType ? `(${credentialSubjectType})` : ""}
      </Accordion.Header>
      <Accordion.Body>
        <div className="d-flex mt-2 align-items-center">
          <GetVcButton
            handleGetFields={handleGetFields}
            getVcSchemeSuccess={getVcSchemeSuccess}
            selectedContext={selectedContext}
          />
        </div>
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
              <CreatePresentationButton
                handleCreatePresentationRequest={
                  handleCreatePresentationRequest
                }
                createPresentationSuccess={createPresentationSuccess}
                createPresentationErrMsg={createPresentationErrMsg}
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

        {!signer ? (
          <div className="mt-3">
            <AccordianToggleButton
              text={"Connect to wallet"}
              eventKey={EventKey.HederaAccount}
            />
          </div>
        ) : null}

        {/* ===== Responders section ====== */}
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
                      {signer && (
                        <ButtonWithLoader
                          onClick={() =>
                            handleSendPresentationRequest({
                              responderDid: did,
                              encyptedKeyId,
                              addLoader,
                              removeLoader,
                              presentationRequest,
                              signer,
                              topicId,
                              cipher,
                              client,
                              responders,
                              setResponders,
                              credentialVerificationKey,
                            })
                          }
                          text="Send request"
                          loading={activeLoaders.includes(
                            `handleSendRequest-${did}`
                          )}
                        />
                      )}
                      <StatusLabel
                        isSuccess={
                          activeLoaders.includes(`handleSendRequest-${did}`)
                            ? undefined
                            : isSuccess
                        }
                        text={statusText}
                      />
                    </div>

                    {/* =====Presentation Response section ====== */}
                    {presentationResponse?.data ? (
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
                    ) : null}
                    {/* ===== end of Presentation Response section ====== */}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
        {/* ===== end of Responders section ====== */}
      </Accordion.Body>
    </Accordion.Item>
  );
};
export default DisclosureRequest;
