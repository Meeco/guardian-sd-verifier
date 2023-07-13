import React, { useState } from "react";
import { delay, documentLoader, generateKeyPair, getSuite } from "../utils";
import { createFile, getFileContents } from "../fileService";
import {
  MessageType,
  PresentationQueryMessage,
  PresentationRequestMessage,
  PresentationResponseMessage,
  QueryResponseMessage,
} from "../types";
import { getTopicMessages } from "../hederaService";
import { submitMessage } from "../consensusService";
import { Client, FileId } from "@hashgraph/sdk";
import moment from "moment";
import { issue, createPresentation, signPresentation } from "@digitalbazaar/vc";
import presentationDefinition from "../mock/presentation_definition.json";

interface VerificationMethodsProps {
  // Hedera client instance
  client: Client;
  // User uploaded credential
  credential: any;
  // Current topic ID for sending/receiving message
  topicId?: string;
  // Verification methods from DID document
  verificationMethods: any;
  handleSetLoading: (value: boolean) => void;
}

const VerificationMethods: React.FC<VerificationMethodsProps> = ({
  client,
  credential,
  topicId,
  verificationMethods,
  handleSetLoading,
}) => {
  // Selected verification method
  const [selectedMethod, setSelectedMethod] = useState<any>();

  const getDisplayedMethod = (input: string) => {
    const index = input.indexOf("#");
    if (index !== -1) {
      return input.slice(index + 1);
    }
    return null;
  };

  const handleGenKeyPair = async (id: string) => {
    const keyPair = await generateKeyPair(id);
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

  // Create authorization_details
  const createAuthDetails = async (credentialSubject: any, issuer: any) => {
    const authDetails = await handleGenKeyPair(credentialSubject.id).then(
      async (keyPair) => {
        // Add one more year to `valid_until`
        const validUntil = moment(credentialSubject.valid_until)
          .add(1, "y")
          .format("YYYY-MM-DD");

        const formattedCredential = getFormattedCredential(
          issuer,
          credentialSubject,
          validUntil
        );
        // Key pairs
        const suite = getSuite(keyPair);
        // Sign the credential
        const signedCredential = await issue({
          credential: formattedCredential,
          suite,
          documentLoader,
        });

        const presentation = createPresentation({
          verifiableCredential: signedCredential,
        });

        const signedPresentation = await signPresentation({
          presentation,
          suite,
          challenge: "challenge",
          documentLoader,
        });
        return signedPresentation;
      }
    );

    return authDetails;
  };

  // Get presentation response from HCS
  const handleGetPresentationResponse = async (
    fileId?: FileId | null,
    queryResponseMessage?: QueryResponseMessage | PresentationResponseMessage
  ) => {
    const presentationRequest: PresentationRequestMessage = {
      operation: MessageType.PRESENTATION_REQUEST,
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

    // Waiting 15s to allow transaction propagation to mirror
    await delay(15000);
    // Get presentation response from mirror node
    const topicMessages = await getTopicMessages(topicId || "");
    const presentationResponseMessage = topicMessages?.filter(
      (msg) => msg.operation === MessageType.PRESENTATION_RESPONSE
    )[0];

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

  const getPresentationResponse = async () => {
    handleSetLoading(true);
    const { credentialSubject, issuer } = credential;
    // create authorization_details
    const authDetails = await createAuthDetails(credentialSubject, issuer);
    // create presentation query message
    const presentationQuery: PresentationQueryMessage = {
      operation: MessageType.PRESENTATION_QUERY,
      // TODO: get vc_id from UI instead of hardcode
      vc_id: "urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9",
      requester_did:
        "did:hedera:testnet:DkUFuWbM49QU13y52cWTotMYXQ84X9cN7u1GJpMVbPv4_0.0.15069804",
      limit_hbar: 1,
    };

    const presentationQueryMessage = JSON.stringify(presentationQuery);
    // Send query message to HCS
    submitMessage(presentationQueryMessage, client, topicId).then(async () => {
      // Waiting 10s to allow transaction propagation to mirror
      await delay(10000);
      // Get query response from mirror node
      const topicMessages = await getTopicMessages(topicId || "");
      const queryResponseMessage = topicMessages?.filter(
        (msg) => msg.operation === MessageType.QUERY_RESPONSE
      )[0];

      // create presentation query file
      const contents = {
        ...presentationDefinition,
        authorization_details: {
          ...authDetails,
          // TODO: update this to use credential's did
          did: "did:hedera:testnet:DkUFuWbM49QU13y52cWTotMYXQ84X9cN7u1GJpMVbPv4_0.0.15069804",
        },
      };

      const presentationResponse = await handleSendPresentationRequest(
        contents,
        queryResponseMessage
      );

      handleSetLoading(false);
    });
  };

  return (
    <div className="verification-method">
      {verificationMethods.map((item: any) => (
        <div key={item.id}>
          <input
            type="radio"
            value={item.id}
            name="verification-method"
            onChange={() => {
              setSelectedMethod(item);
            }}
          />
          <label htmlFor="label">#{getDisplayedMethod(item.id)}</label>
        </div>
      ))}
      {selectedMethod && (
        <div className="request-button">
          <button onClick={getPresentationResponse}>Request</button>
        </div>
      )}
    </div>
  );
};

export default VerificationMethods;