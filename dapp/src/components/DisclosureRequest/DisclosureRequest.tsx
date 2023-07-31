import { BladeSigner } from "@bladelabs/blade-web3.js";
import { FileId } from "@hashgraph/sdk";
import { Ed25519VerificationKey2018 } from "@transmute/ed25519-signature-2018";
import React, { useState } from "react";
import { Accordion, FormCheck, FormGroup } from "react-bootstrap";
import ReactJson from "react-json-view";
import { v4 as uuidv4 } from "uuid";
import { LoadingState } from "../../App";
import { submitMessage } from "../../consensusService";
import { createFile } from "../../fileService";
import { getTopicMessages } from "../../hederaService";
import {
  MessageType,
  PresentationRequestMessage,
  PresentationResponseMessage,
} from "../../types";
import { documentLoader, generateKeyPair, pollRequest } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { Button, StatusLabel } from "../common";

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
  // TODO: Update this field
  const credentialType = "8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0";
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

    const handleGenKeyPair = async () => {
      const keyPair = await generateKeyPair({
        privateKeyHex: credPrivateKey,
      });

      return keyPair;
    };

    // Create file in HFS

    const handleCreateFile = async () => {
      setLoading({ id: "handleCreateFile" });
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

        const presentationDefinition = createPresentationDefinition(vcFile.id);

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
          // TODO: Remove hardcode
          // setFileId("fileId" as unknown as FileId);
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

          // get response file's contents
          const responseFileId =
            (
              presentationResponseMessage as
                | PresentationResponseMessage
                | undefined
            )?.response_file_id || "";

          // TODO: Remove mock data
          // const fileContents = await getFileContents(signer, responseFileId);
          const fileContents = {
            verifiablePresentation: {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://identity.foundation/presentation-exchange/submission/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
              ],
              type: ["VerifiablePresentation", "PresentationSubmission"],
              presentation_submission: {
                id: "5z6Jn6YM7FQhLUvybVVej",
                definition_id: "33bdb7eb-20fe-47dd-bed3-3f6c582d44d1",
                descriptor_map: [
                  {
                    id: "audit",
                    format: "ldp_vc",
                    path: "$.verifiableCredential[0]",
                  },
                ],
              },
              verifiableCredential: [
                {
                  "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://w3id.org/security/suites/bls12381-2020/v1",
                    "https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe",
                  ],
                  id: "urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9",
                  type: "VerifiableCredential",
                  description: "iRec Application Details",
                  identifier: "b5a8ec55-505b-4309-a6a1-6cd2ea270d71",
                  name: "iRec Application Details",
                  credentialSubject: {
                    id: "did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570",
                    type: "8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0",
                    field3: "255 345 345",
                  },
                  expirationDate: "2029-12-03T12:19:52Z",
                  issuanceDate: "2019-12-03T12:19:52Z",
                  issuer:
                    "did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570",
                  proof: {
                    type: "BbsBlsSignatureProof2020",
                    created: "2023-07-04T04:39:40Z",
                    nonce:
                      "lGLXeOXmKIdrT8ZYrpwJkxvWwNrYQG+SRdC0WzUiqhCLK3w+wWLTzyBI5gqsno3ogxU=",
                    proofPurpose: "assertionMethod",
                    proofValue:
                      "ACAA/4CAD6sM4cCvN3LxpBkcHm0AayWjcvgfT5FdQYpGElROQWoXswChbUwebiDgTHp1aowHA41S85HUN87n5yGJGCY1vaoUc5BMBHcL9Y9eeroUdkIVUT7Se78dGdABCQc9lJyb8ZiZWhWKe+sFJwtsF0DxDsslAyh+VJ5gH+BN5mOqMIQpTAYLEeXBd2tC6x0VI9Q5NgAAAHSMnDoBQe9OmNthN3oOP7l3Vs4Ius+bU3PTXq6PktBLoNqIalBWt4GJEeal6J24lAUAAAACJdOsW/Y9Azf91Qb6KRc/xwyF0Gh4QRsq7LERreBq1v1g0RQmBk7QgmXFByo/q5EyYj/KHCnz4HX3M06OSp0F1a8LOpko/sJ8sz8vNT2RFA5p9HW+0RHUVWN5qE9zFCrllPKhKrjsvshWo9cuLnodlgAAABQ5/JLTrbW+MBNpAVm2GxPag6G/U3Z6ox1URJFMykhatzJF4MB77A84YYO2P/QJ4/riMJn0xlYgX8DcZZmAI7nwHJSYFkcUkFVSGuRLvG5ulLHdaS/FCSyYEMLCpmaUxbgPa/J6cAaVEdS7TIRrNTH6JfSGPioLnn4ijVM7kofcpRdGLseXrfUcbKUj7AQWvjLBOiikvvGzXM+A0pLA9wWJa6wLAxXVJd10BhyzgrbqR7mIRN7SVjeGs+z4gQ+9UeQfO5B01m9xzC+5TFNAw/2++6Yx8gigjHmMUkyBCZQ8nDC0d2jK3Vm/6kFnNQNNIWSXNli6OVmLjR0dtW3b19iTAkxlnXdhG84KKj8unl6BA5JbNOEDaWf/4cMjBOPjbNpSaA6q6yF25GBeWTZoaJwqdJPjjqdenFLtQEIe2h66EiqwIqQJcx/0Pvw4QiUX3kIbReK9xL3AcYH4B7ZzMIg1Kj8p0S96Wv/hWbqpVudc5VOKIhEKewS+EqLK32+psbIxr6kgfEcy85BOhna1IKmQJLpvkL+BFvr+9QyYfkwnkRHHc8BNfqgs/ua/BERPojnLuXnhkCDHszndFdGfReCjVnCGtyAZCQk4tYpOJ32v5SqPmLKn37FjsE0MMD+lzo1D9FCPuZCEgYnd4abUOIYSLLetkEB9uaO3ogJ881FOLxUfgSLEpA6aFLUKjimacTsjT+RuCOBaDyjxxiLQ8izITvpRwxTy1+MWikeu49PJr58SKAs4583kUSaqpXLHtUkwo84SfaR1Bgxfq6fj7fia+7xacYVRWJCaGPanuaqhegzO0POJCfjWiPJveQ3KPKEa36AYQRgIhRXTzDknJcCp",
                    verificationMethod:
                      "did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570#did-root-key-bbs",
                  },
                },
              ],
              proof: {
                type: "Ed25519Signature2020",
                created: "2023-07-17T08:05:47Z",
                verificationMethod:
                  "did:hedera:testnet:7Q43LNex593B8AQHgN3nrxYZEirrx5GSBwaZc9mbWpc2_0.0.15036794#did-root-key",
                proofPurpose: "authentication",
                challenge: "78",
                proofValue:
                  "zV8DnmbUvL15ZBNsvHYxoMDkGr5DdkBQiyusKKkxaf2k8Yv5v8mNWaHumUiNpdWGzUve7RQ5rX6EBZ12eqpkjU5n",
              },
            },
            presentationSubmissionLocation: 1,
            presentationSubmission: {
              id: "5z6Jn6YM7FQhLUvybVVej",
              definition_id: "33bdb7eb-20fe-47dd-bed3-3f6c582d44d1",
              descriptor_map: [
                {
                  id: "audit",
                  format: "ldp_vc",
                  path: "$.verifiableCredential[0]",
                },
              ],
            },
          };
          if (fileContents) {
            setSendRequestSuccess(true);
            return fileContents;
          } else {
            setSendRequestSuccess(false);
          }
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
