import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useCallback, useContext, useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import ReactJson from "react-json-view";
import { EventKey } from "../../../constants";
import { downloadJson } from "../../../utils";
import { AppContext } from "../../AppProvider";
import {
  AccordionToggleButton,
  Button as ButtonWithLoader,
  StatusLabel,
} from "../../common";
import createEncryptedFile from "../createEncryptedFile";
import decryptPresentationResponseMessage from "../decryptPresentationResponseMessage";
import handleSendPresentationRequest from "../handleSendPresentationRequest";

interface FileResponse {
  did: string;
  fileId: string;
}

export interface PresentationResponseTopicMessage {
  fileCid?: string;
  error?: {
    message?: string;
  };
}

const DisclosureRequest = () => {
  const {
    provider,
    topicId,
    activeLoaders,
    addLoader,
    removeLoader,
    credentialVerificationKey,
    responders,
    setResponders,
    presentationRequest,
    cipher,
    signer,
    network,
  } = useContext(AppContext);

  const [
    presentationResponseTopicMessage,
    setPresentationResponseTopicMessage,
  ] = useState<PresentationResponseTopicMessage>();
  const [fileResponses, setFileResponses] = useState<FileResponse[]>([]);

  const getResponderFile = useCallback(
    (did: string) => {
      return fileResponses.find((item) => item.did === did);
    },
    [fileResponses]
  );

  const fileResponseStatus = (did: string, loaderId: string) => {
    if (activeLoaders.includes(loaderId)) {
      return;
    }

    const file = getResponderFile(did);
    if (file) {
      if (file.fileId) return true;
      else return false;
    }
  };

  const fileResponseStatusMessage = (did: string) => {
    const file = getResponderFile(did);
    if (file) {
      if (file.fileId) return `fileId: ${file.fileId}`;
      else return "Create file failed, please try again";
    } else return "";
  };

  const presentationResponseTopicMessageStatus = (
    topicMessage: any,
    loaderId: string
  ) => {
    if (activeLoaders.includes(loaderId)) {
      return;
    }
    if (topicMessage !== undefined) {
      if (topicMessage?.fileCid) return true;
      else return false;
    }
  };

  const presentationResponseTopicMessageStatusMessage = (
    presentationResponse: any
  ) => {
    if (presentationResponseTopicMessage !== undefined) {
      if (presentationResponseTopicMessage?.fileCid)
        return "Response file's CID received from HCS";
      else return presentationResponse?.error?.message ?? "Send request failed";
    } else return "";
  };

  const presentationResponseStatus = (
    presentationResponse: any,
    loaderId: string
  ) => {
    if (activeLoaders.includes(loaderId)) {
      return;
    }
    if (presentationResponse !== undefined) {
      if (presentationResponse?.data) return true;
      else return false;
    }
  };

  const presentationResponseStatusMessage = (presentationResponse: any) => {
    if (presentationResponse !== undefined) {
      if (presentationResponse?.data) return "Success";
      else
        return (
          presentationResponse?.error?.message ??
          "Fetch presentation response failed"
        );
    } else return "";
  };

  const handleCreateEncryptedFile = useCallback(
    async ({
      encryptedKeyId,
      did,
      signer,
      loaderId,
    }: {
      encryptedKeyId: string;
      did: string;
      signer: HashConnectSigner;
      loaderId: string;
    }) => {
      // Remove old file before creating new file
      setFileResponses((prev) => prev.filter((item) => item.did !== did));

      // Remove old response from responder before sending new request
      setResponders((prev) =>
        prev.map((responder) => {
          if (responder.did === did) {
            return { ...responder, presentationResponse: undefined };
          } else return responder;
        })
      );

      // Create new file
      const fileId = await createEncryptedFile({
        encryptedKeyId,
        cipher,
        responderDid: did,
        presentationRequest,
        signer,
        provider,
        addLoader,
        removeLoader,
        loaderId,
        network,
      });
      if (fileId) {
        setFileResponses((prev) => [
          ...prev,
          { did, fileId: fileId.toString() },
        ]);
      } else {
        setFileResponses((prev) => [...prev, { did, fileId: "" }]);
      }
    },
    [
      addLoader,
      cipher,
      presentationRequest,
      provider,
      removeLoader,
      setResponders,
      network,
    ]
  );

  return (
    <Accordion.Item eventKey={EventKey.DisclosureRequest}>
      <Accordion.Header>
        <b>Disclosure Requests</b>
      </Accordion.Header>
      <Accordion.Body>
        {!signer ? (
          <div className="mt-2">
            <AccordionToggleButton
              text={"Connect to wallet"}
              eventKey={EventKey.HederaAccount}
            />
          </div>
        ) : null}
        {!presentationRequest ? (
          <div className="mt-2">
            <AccordionToggleButton
              text={"Create Presentation"}
              eventKey={EventKey.VCAndPresentationDefinition}
            />
          </div>
        ) : null}
        {responders.length === 0 ? (
          <div className="mt-2">
            <AccordionToggleButton
              text={"Query Responders"}
              eventKey={EventKey.QueryResponders}
            />
          </div>
        ) : null}

        {/* ===== Responders section ====== */}
        {responders &&
          presentationRequest &&
          responders.map((responder) => {
            const { accountId, did, presentationResponse, encryptedKeyId } =
              responder;

            const file = getResponderFile(did);

            const createFileLoaderId = `createEncryptedFile-${did}`;
            const sendRequestLoaderId = `handleSendRequest-${did}`;
            const getResponseFileLoaderId = `getResponseFile-${did}`;

            const isCreateFileSuccess = fileResponseStatus(
              did,
              createFileLoaderId
            );

            const isSendPresentationRequestSuccess =
              presentationResponseTopicMessageStatus(
                presentationResponseTopicMessage,
                sendRequestLoaderId
              );

            const isReceiveResponseSuccess = presentationResponseStatus(
              presentationResponse,
              getResponseFileLoaderId
            );

            return (
              <Accordion key={did}>
                <Accordion.Item className="mt-2" eventKey={did}>
                  <Accordion.Header>
                    {did} ({accountId})
                  </Accordion.Header>
                  <Accordion.Body>
                    {signer && (
                      <div className="d-flex mt-2">
                        <ButtonWithLoader
                          onClick={() =>
                            handleCreateEncryptedFile({
                              encryptedKeyId,
                              did,
                              signer,
                              loaderId: createFileLoaderId,
                            })
                          }
                          text="Create request file"
                          loading={activeLoaders.includes(createFileLoaderId)}
                          requireApproval
                          disabled={
                            activeLoaders.length > 0
                              ? !activeLoaders.find(
                                  (item) => item === createFileLoaderId
                                )
                              : false
                          }
                        />
                        <StatusLabel
                          isSuccess={
                            activeLoaders.includes(createFileLoaderId)
                              ? undefined
                              : isCreateFileSuccess
                          }
                          text={fileResponseStatusMessage(did)}
                        />
                      </div>
                    )}

                    {file?.fileId && signer ? (
                      <div className="d-flex mt-2">
                        <ButtonWithLoader
                          onClick={() =>
                            handleSendPresentationRequest({
                              fileId: file.fileId,
                              responderDid: did,
                              addLoader,
                              removeLoader,
                              signer,
                              topicId,
                              loaderId: sendRequestLoaderId,
                              network,
                              setPresentationResponseTopicMessage,
                            })
                          }
                          text="Send Presentation Request"
                          loading={activeLoaders.includes(sendRequestLoaderId)}
                          requireApproval
                          disabled={
                            activeLoaders.length > 0
                              ? !activeLoaders.find(
                                  (item) => item === sendRequestLoaderId
                                )
                              : false
                          }
                        />
                        <StatusLabel
                          isSuccess={
                            activeLoaders.includes(sendRequestLoaderId)
                              ? undefined
                              : isSendPresentationRequestSuccess
                          }
                          text={presentationResponseTopicMessageStatusMessage(
                            presentationResponseTopicMessage
                          )}
                        />
                      </div>
                    ) : null}

                    {presentationResponseTopicMessage?.fileCid ? (
                      <div className="d-flex mt-2">
                        <ButtonWithLoader
                          onClick={() =>
                            decryptPresentationResponseMessage({
                              cipher,
                              credentialVerificationKey,
                              fileCid:
                                presentationResponseTopicMessage?.fileCid ?? "",
                              addLoader,
                              removeLoader,
                              loaderId: getResponseFileLoaderId,
                              responderDid: did,
                              responders,
                              setResponders,
                            })
                          }
                          text={
                            isReceiveResponseSuccess === false
                              ? "Get Response File - Try again"
                              : "Get Response File"
                          }
                          loading={activeLoaders.includes(
                            getResponseFileLoaderId
                          )}
                          disabled={
                            activeLoaders.length > 0
                              ? !activeLoaders.find(
                                  (item) => item === getResponseFileLoaderId
                                )
                              : false
                          }
                        />
                        <StatusLabel
                          isSuccess={
                            activeLoaders.includes(getResponseFileLoaderId)
                              ? undefined
                              : isReceiveResponseSuccess
                          }
                          text={presentationResponseStatusMessage(
                            presentationResponse
                          )}
                        />
                      </div>
                    ) : null}

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
