import { BladeSigner } from "@bladelabs/blade-web3.js";
import * as Hedera from "@hashgraph/sdk";
import { FileId } from "@hashgraph/sdk";
import * as nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util";
import { LoadingState } from "../../App";
import { createFile } from "../../fileService";
import { documentLoader, generateKeyPair } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { createPresentationDefinition } from "./createPresentationDefinition";

// TODO: Use responder's key from response instead of using mock
// ===================>
const responderPrivateKeyHex =
  "302e020100300506032b657004220420edd56e1aac0e19df3002f67b02d3fd134f67fc25a8882e1f83bcb1110052b7be";
const responderPrivateKeyBytes = Hedera.PrivateKey.fromString(
  responderPrivateKeyHex
).toBytes();

const responderEmphem = nacl.box.keyPair.fromSecretKey(
  responderPrivateKeyBytes
);
// <===================

const handleGenKeyPair = async (credPrivateKey: string) => {
  const keyPair = await generateKeyPair({
    privateKeyHex: credPrivateKey,
  });

  return keyPair;
};

const createPresentationRequest = async ({
  setLoading,
  credPrivateKey,
  verifiableCredential,
  vcFile,
  selectedFields,
  credentialSubject,
  signer,
  setFileId,
  setCreatePresentationSuccess,
  setPresentationRequest,
  requesterEmphem,
  requesterNonce,
}: {
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  credPrivateKey: string;
  verifiableCredential: any;
  vcFile: any;
  selectedFields: string[];
  credentialSubject: any;
  signer: BladeSigner;
  setFileId: React.Dispatch<React.SetStateAction<FileId | null | undefined>>;
  setCreatePresentationSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  setPresentationRequest: React.Dispatch<any>;
  requesterEmphem: nacl.BoxKeyPair;
  requesterNonce: Uint8Array;
}) => {
  setLoading({ id: "createPresentationRequest" });

  const keyPair = await handleGenKeyPair(credPrivateKey);
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
    const contents = JSON.stringify({
      ...presentationDefinition,
      authorization_details: {
        ...authDetails,
        did: credentialSubject.id,
      },
    });

    const message = naclUtil.decodeUTF8(contents);
    const encryptedMessage = nacl.box(
      message,
      requesterNonce,
      responderEmphem.publicKey!,
      requesterEmphem.secretKey
    );

    const encryptedMessageBase64 = naclUtil.encodeBase64(encryptedMessage);

    const fileId = await createFile(signer, encryptedMessageBase64);
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

export default createPresentationRequest;
