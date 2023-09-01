import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { createSuite, documentLoader } from "../../utils";
import { createAuthDetails } from "../../utils/createAuthDetails";
import { createPresentationDefinition } from "./createPresentationDefinition";

const createPresentationRequest = async ({
  addLoader,
  removeLoader,
  credentialVerificationKey,

  selectedMethod,
  verifiableCredential,
  vcResponse,
  selectedFields,
  credentialSubject,
  setCreatePresentationSuccess,
  setPresentationRequest,
}: {
  addLoader: (id: string) => void;
  removeLoader: (removedId: string) => void;
  credentialVerificationKey: any;
  selectedMethod: any;
  verifiableCredential: any;
  vcResponse: any;
  selectedFields: string[];
  credentialSubject: any;
  setCreatePresentationSuccess: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  setPresentationRequest: React.Dispatch<any>;
}) => {
  addLoader("createPresentationRequest");
  if (credentialVerificationKey) {
    const suite = await createSuite({
      type: selectedMethod.type,
      verificationKey: credentialVerificationKey,
    });

    const verificationKey2020 =
      selectedMethod.type === "Ed25519VerificationKey2020"
        ? credentialVerificationKey
        : await Ed25519VerificationKey2020.from({
            ...credentialVerificationKey,
            keyPair: credentialVerificationKey,
          });
    // create authorization_details
    const authDetails = await createAuthDetails({
      verifiableCredential,
      challenge: "challenge",
      documentLoader,
      verificationKey: verificationKey2020,
      suite,
    });

    const presentationDefinition = createPresentationDefinition(
      vcResponse.id,
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
    removeLoader("createPresentationRequest");
    setCreatePresentationSuccess(true);
  } else {
    setCreatePresentationSuccess(false);
    throw new Error("Key data is required");
  }
};

export default createPresentationRequest;
