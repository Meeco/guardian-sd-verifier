import { documentLoader } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { CredentialKey, LoadingState } from "../AppProvider";
import { createPresentationDefinition } from "./createPresentationDefinition";

const createPresentationRequest = async ({
  setLoading,
  credentialKey,
  verifiableCredential,
  vcFile,
  selectedFields,
  credentialSubject,
  setCreatePresentationSuccess,
  setPresentationRequest,
}: {
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  credentialKey: CredentialKey;
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

  if (credentialKey) {
    const { verificationKey, suite } = credentialKey;
    // create authorization_details
    const authDetails = await createAuthDetails({
      verifiableCredential,
      challenge: "challenge",
      documentLoader,
      verificationKey,
      suite,
    });

    const presentationDefinition = createPresentationDefinition(
      vcFile.id,
      selectedFields
    );

    // create presentation query file
    const contents = {
      ...presentationDefinition,
      authorization_details: {
        ...authDetails,
        did: credentialSubject.id,
      },
    };

    setPresentationRequest(contents);
    setLoading({ id: undefined });
    setCreatePresentationSuccess(true);
  } else {
    setCreatePresentationSuccess(false);
    throw new Error("Key data is required");
  }
};

export default createPresentationRequest;
