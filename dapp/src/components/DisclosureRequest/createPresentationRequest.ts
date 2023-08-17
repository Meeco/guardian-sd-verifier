import { LoadingState } from "../../App";
import { documentLoader, generateKeyPair } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { createPresentationDefinition } from "./createPresentationDefinition";

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
  setCreatePresentationSuccess,
  setPresentationRequest,
}: {
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  credPrivateKey: string;
  verifiableCredential: any;
  vcFile: any;
  selectedFields: string[];
  credentialSubject: any;
  setCreatePresentationSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  setPresentationRequest: React.Dispatch<any>;
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

    setPresentationRequest(contents);
    setLoading({ id: undefined });
    setCreatePresentationSuccess(true);
  } else {
    setCreatePresentationSuccess(false);
    throw new Error("Key data is required");
  }
};

export default createPresentationRequest;
