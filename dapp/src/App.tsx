import { ChangeEvent, useEffect, useState } from "react";
import { fetchResolveDid } from "./didService";
import { createPresentation, issue, signPresentation } from "@digitalbazaar/vc";
import { generateKeyPair, getSuite, documentLoader, delay } from "./utils";
import moment from "moment";
import { createHederaClient, getTopicMessages } from "./hederaService";
import { makeTopic, submitMessage } from "./consensusService";
import {
  MessageType,
  PresentationQueryMessage,
  PresentationRequestMessage,
  PresentationResponseMessage,
  QueryResponseMessage,
} from "./types";
import { createFile, getFileContents } from "./fileService";
import presentationDefinition from "./mock/presentation_definition.json";
import { FullPageLoader } from "./components";
import "./App.css";

function App() {
  const accountId = process.env.REACT_APP_MY_ACCOUNT_ID || "";
  const privateKey = process.env.REACT_APP_MY_PRIVATE_KEY || "";
  const client = createHederaClient(accountId, privateKey);

  const [loading, setLoading] = useState(false);

  const [verificationMethods, setVerificationMethods] = useState([]);
  const [credential, setCredential] = useState<any>();
  const [verifiableCredentialDid, setVerifiableCredentialDid] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<any>();
  const [topicId, setTopicId] = useState<string | undefined>();

  const getVerificationMethods = async () => {
    setLoading(true);
    const { didDocument } = await fetchResolveDid(verifiableCredentialDid);
    const { verificationMethod } = didDocument;
    setVerificationMethods(verificationMethod);
    setLoading(false);
  };

  const handleExtractDid = (credential: any) => {
    if (credential) {
      const { credentialSubject } = credential;
      setVerifiableCredentialDid(credentialSubject.id);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        const str: string = (e.target?.result as string) || "";
        if (str) {
          handleExtractDid(JSON.parse(str));
          setCredential(JSON.parse(str));
        }
      };
    }
  };

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

  const createAuthPresentation = async (
    credentialSubject: any,
    issuer: any
  ) => {
    const presentation = await handleGenKeyPair(credentialSubject.id).then(
      async (keyPair) => {
        const date = moment(credentialSubject.valid_until)
          .add(1, "y")
          .format("YYYY-MM-DD");

        const formattedCredential = {
          ...credential,
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz",
          ],
          issuer: {
            ...issuer,
            id: credentialSubject.id,
            name: "Self Asserted",
          },
          credentialSubject: {
            ...credentialSubject,
            type: "auditor_template",
            valid_until: date,
          },
        };
        delete formattedCredential.credentialStatus;

        const suite = getSuite(keyPair);
        const signedVC = await issue({
          credential: formattedCredential,
          suite,
          documentLoader,
        });

        const presentation = createPresentation({
          verifiableCredential: signedVC,
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

    return presentation;
  };

  const submitPresentationQueryMessage = async () => {
    setLoading(true);
    const { credentialSubject, issuer } = credential;
    // create authorization_details
    const authPresentation = await createAuthPresentation(
      credentialSubject,
      issuer
    );
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
    submitMessage(presentationQueryMessage, client, topicId).then(
      async () => {
        // Waiting 10s to allow transaction propagation to mirror
        await delay(10000);
        const topicMessages = await getTopicMessages(topicId || "");
        const queryResponseMessage = topicMessages?.filter(
          (msg) => msg.operation === MessageType.QUERY_RESPONSE
        )[0];

        // create presentation query file
        const contents = {
          ...presentationDefinition,
          authorization_details: {
            ...authPresentation,
            // TODO: update this to use credential's did
            did: "did:hedera:testnet:DkUFuWbM49QU13y52cWTotMYXQ84X9cN7u1GJpMVbPv4_0.0.15069804",
          },
        };
        createFile(
          client,
          process.env.REACT_APP_RESPONDER_DID_PRIVATE_KEY_HEX || "",
          process.env.REACT_APP_RESPONDER_DID_PUBLIC_KEY_HEX || "",
          JSON.stringify(contents)
        ).then(async (fileId) => {
          console.log({ queryResponseMessage });
          const presentationRequest: PresentationRequestMessage = {
            operation: MessageType.PRESENTATION_REQUEST,
            recipient_did:
              (queryResponseMessage as QueryResponseMessage)
                ?.responder_did || "",
            request_file_id: fileId?.toString() || "",
            // TODO: Update this field later
            request_file_dek_encrypted_base64: "",
            // TODO: Update this field later
            request_file_public_key_id: "",
          };
          // send file to HCS
          const presentationRequestMessage =
            JSON.stringify(presentationRequest);
          submitMessage(presentationRequestMessage, client, topicId);
          // Waiting 15s to allow transaction propagation to mirror
          await delay(15000);
          const topicMessages = await getTopicMessages(topicId || "");
          const presentationResponseMessage = topicMessages?.filter(
            (msg) =>
              msg.operation === MessageType.PRESENTATION_RESPONSE
          )[0];
          // get response file's contents
          const responseFileId =
            (
              presentationResponseMessage as
              | PresentationResponseMessage
              | undefined
            )?.response_file_id || "";
          const contents = await getFileContents(
            client,
            responseFileId
          );
          setLoading(false);
        });
      }
    );
  };

  useEffect(() => {
    makeTopic(client).then((id) => {
      setTopicId(id?.toString());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      {loading && <FullPageLoader />}
      <div className="file">
        <h3>Authorisation Credential</h3>
        <input
          type="file"
          name="vc-file"
          id="vc-file"
          onChange={handleFileChange}
        />
      </div>
      {verifiableCredentialDid ? (
        <>
          <div className="did">
            <p>
              <b>DID:</b> {verifiableCredentialDid}
            </p>
          </div>
          <div>
            <button onClick={getVerificationMethods}>
              Get verification Method(s)
            </button>
            {verificationMethods && (
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
                    <label htmlFor="label">
                      #{getDisplayedMethod(item.id)}
                    </label>
                  </div>
                ))}
                {selectedMethod && (
                  <div className="request-button">
                    <button
                      onClick={
                        submitPresentationQueryMessage
                      }
                    >
                      Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default App;
