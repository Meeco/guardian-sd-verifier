import { useContext } from "react";
import { Accordion, Button } from "react-bootstrap";
import ReactJson from "react-json-view";
import { EventKey } from "../../../constants";
import { downloadJson } from "../../../utils";
import { AppContext } from "../../AppProvider";
import {
  AccordianToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../../common";
import handleSendPresentationRequest from "../handleSendPresentationRequest";

const DisclosureRequest = () => {
  const {
    client,
    signer,
    topicId,
    activeLoaders,
    addLoader,
    removeLoader,
    credentialVerificationKey,
    responders,
    setResponders,
    presentationRequest,
    cipher,
  } = useContext(AppContext);

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

  return (
    <Accordion.Item eventKey={EventKey.DisclosureRequest}>
      <Accordion.Header>
        <b>Disclosure Requests</b>
      </Accordion.Header>
      <Accordion.Body>
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
            const { accountId, did, presentationResponse, encryptedKeyId } =
              responder;
            const isSuccess = presentationResponseStatus(
              presentationResponse,
              did
            );
            const statusText =
              presentationResponseStatusMessage(presentationResponse);

            return (
              <Accordion key={did}>
                <Accordion.Item className="mt-2" eventKey={did}>
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
                              encryptedKeyId,
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
